"""Recuperación de películas para el contexto del chat (RAG textual).

En esta fase usamos búsqueda por texto sobre PostgreSQL (sin pgvector ni
trigram; se evalúa agregarlos solo si un benchmark lo justifica).

Objetivo: acotar un conjunto de películas REALES de la tabla `Movie` para que
Gemini responda únicamente con ellas.

Estrategia (en SQL, no en Python sobre todo el catálogo):
1. Seed por título (título mencionado por el usuario).
2. Filtro por género + década.
3. Fallback por palabras clave en el overview.
4. Si hubo intención (título/género/década/palabras) pero nada matcheó →
   `matched=False` para que Gemini diga "no encontré".
5. Si no hubo intención (consulta genérica) → populares como contexto base.
"""

from __future__ import annotations

import re

from django.db.models import Q

from App.models import Movie

CONTEXT_LIMIT = 8

# ---------------------------------------------------------------------------
# Sinónimos de género (español/inglés) → nombre de género tal como está en DB
# ---------------------------------------------------------------------------
GENRE_SYNONYMS = {
    # Animación / familia
    'animacion': 'Animation', 'animación': 'Animation', 'animation': 'Animation',
    'animadas': 'Animation', 'animada': 'Animation', 'animados': 'Animation',
    'animado': 'Animation', 'anime': 'Animation', 'dibujos': 'Animation',
    'dibujos animados': 'Animation', 'caricatura': 'Animation', 'cartoon': 'Animation',
    'infantil': 'Family', 'infantiles': 'Family', 'familia': 'Family',
    'family': 'Family', 'kids': 'Family',
    # Terror
    'terror': 'Horror', 'horror': 'Horror', 'miedo': 'Horror', 'scary': 'Horror',
    # Comedia / romance
    'comedia': 'Comedy', 'comedias': 'Comedy', 'comedy': 'Comedy',
    'romance': 'Romance', 'romantica': 'Romance', 'romántica': 'Romance',
    'romanticas': 'Romance', 'románticas': 'Romance',
    # Acción / aventura
    'accion': 'Action', 'acción': 'Action', 'action': 'Action',
    'aventura': 'Adventure', 'aventuras': 'Adventure', 'adventure': 'Adventure',
    # Drama
    'drama': 'Drama', 'dramas': 'Drama',
    # Ciencia ficción / fantasía
    'ciencia ficcion': 'Science Fiction', 'ciencia ficción': 'Science Fiction',
    'science fiction': 'Science Fiction', 'science-fiction': 'Science Fiction',
    'sci-fi': 'Science Fiction', 'sci fi': 'Science Fiction',
    'scifi': 'Science Fiction', 'ciencia': 'Science Fiction',
    'fantasia': 'Fantasy', 'fantasía': 'Fantasy', 'fantasy': 'Fantasy',
    # Suspenso / misterio / crimen
    'suspenso': 'Thriller', 'suspense': 'Thriller', 'thriller': 'Thriller',
    'misterio': 'Mystery', 'mystery': 'Mystery',
    'crimen': 'Crime', 'crime': 'Crime', 'policial': 'Crime', 'policiales': 'Crime',
    # Documental / historia / guerra / western / música
    'documental': 'Documentary', 'documentales': 'Documentary', 'documentary': 'Documentary',
    'historia': 'History', 'history': 'History', 'historico': 'History',
    'guerra': 'War', 'war': 'War', 'belica': 'War', 'bélica': 'War',
    'western': 'Western', 'vaquera': 'Western',
    'musical': 'Music', 'musica': 'Music', 'música': 'Music', 'music': 'Music',
    'concierto': 'Music',
    # TV Movie
    'tv movie': 'TV Movie', 'telefilm': 'TV Movie',
}

_STOPWORDS = {
    'pelicula', 'peliculas', 'película', 'películas', 'filme', 'filmes',
    'parecida', 'parecidas', 'parecido', 'parecidos', 'similar', 'similares',
    'recomiendame', 'recomiéndame', 'recomienden', 'recomendar', 'recomendacion',
    'recomendaciones', 'recomendación', 'recomendaciones',
    'algo', 'como', 'a', 'de', 'del', 'la', 'las', 'el', 'los', 'lo',
    'que', 'ver', 'para', 'con', 'mi', 'mis', 'tu', 'tus', 'su', 'sus',
    'familia', 'una', 'un', 'unas', 'unos', 'me', 'gusta', 'gustaria', 'gustaría',
    'gustar', 'quiero', 'quieres', 'quieran', 'busco', 'buscando', 'ver', 'algun',
    'alguna', 'algunas', 'algunos', 'sobre', 'acerca', 'en', 'por',
    'movie', 'movies', 'film', 'films', 'like', 'to', 'the', 'an', 'and', 'or',
    'for', 'with', 'my', 'your', 'family', 'watch', 'something', 'about',
    'recommend', 'recommendation', 'looking', 'some', 'me', 'i', 'want',
}


def _normalize(value: str) -> str:
    """Minúsculas y sin tildes, para comparar de forma robusta."""
    value = (value or '').strip().lower()
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ü': 'u',
    }
    for src, dst in replacements.items():
        value = value.replace(src, dst)
    return value


def _search_form(value: str) -> str:
    """Forma normalizada con palabras separadas por un solo espacio y bordes."""
    value = _normalize(value)
    value = re.sub(r'[^a-z0-9]+', ' ', value)
    return ' ' + ' '.join(value.split()) + ' '


def _detect_genres(message: str) -> list[str]:
    """Devuelve los géneros (en formato DB) mencionados en el mensaje.

    Usa matching por token/palabra completa (con bordes de espacio) para evitar
    falsos positivos del tipo "interacción" → "acción".
    """
    haystack = _search_form(message)
    found = []
    for synonym, genre in GENRE_SYNONYMS.items():
        needle = _search_form(synonym)
        if needle in haystack and genre not in found:
            found.append(genre)
    return found


def _detect_decade(message: str):
    """Devuelve (año_inicio, año_fin) si el mensaje menciona una década."""
    normalized = _normalize(message)
    # "1990", "1990s", "2000s"
    m = re.search(r'\b(19\d{2}|20\d{2})s?\b', normalized)
    if m:
        year = int(m.group(1))
        start = year - (year % 10)
        return str(start), str(start + 9)
    # "los 90", "años 80", "the 70s", "década del 90"
    m = re.search(r'\b(?:anos|años|los|the|decada|década)\s+([2-9]\d)s?\b', normalized)
    if m:
        yy = int(m.group(1))
        start = 1900 + yy - (yy % 10)
        return str(start), str(start + 9)
    # "90s", "80s"
    m = re.search(r'\b([2-9]\d)s\b', normalized)
    if m:
        yy = int(m.group(1))
        start = 1900 + yy - (yy % 10)
        return str(start), str(start + 9)
    return None


def _extract_title_candidates(message: str) -> list[str]:
    """Tokens candidatos a título, excluyendo stopwords y palabras de género."""
    tokens = re.findall(r'[a-z0-9]+', _normalize(message))
    genre_words = {_search_form(s).strip() for s in GENRE_SYNONYMS.keys()}
    genre_words |= {_normalize(g) for g in GENRE_SYNONYMS.values()}

    remaining = [
        t for t in tokens
        if t not in _STOPWORDS and t not in genre_words and not t.isdigit()
    ]
    if not remaining:
        return []
    candidates = [' '.join(remaining)]
    candidates += [t for t in remaining if len(t) >= 3]
    return candidates


def _find_seed_movies_exact(message: str):
    """Busca un título EXACTO mencionado en el mensaje (prioridad alta)."""
    candidates = _extract_title_candidates(message)
    for cand in candidates:
        if len(cand) < 2:
            continue
        exact = Movie.objects.filter(is_active=True, title__iexact=cand).first()
        if exact:
            return [exact]
    return []


def _find_seed_movies_fuzzy(message: str):
    """Busca títulos por subcadena (fallback de menor prioridad)."""
    candidates = _extract_title_candidates(message)
    for cand in candidates:
        if len(cand) < 3:
            continue
        hits = list(Movie.objects.filter(is_active=True, title__icontains=cand)[:5])
        if hits:
            return hits
    return []


def _candidates_by_genre_overlap(seed):
    """Candidatas que comparten géneros con la película de referencia."""
    seed_genres = [g for g in (seed.genres or []) if isinstance(g, str)]
    if not seed_genres:
        return []

    q = Q()
    for genre in seed_genres:
        q |= Q(genres__contains=[genre])

    # Acotamos a un pool reducido y puntuamos en Python (barato).
    pool = list(
        Movie.objects.filter(is_active=True).exclude(id=seed.id).filter(q)
        .order_by('-popularity', '-vote_average')[:200]
    )

    seed_set = {_normalize(g) for g in seed_genres}
    scored = []
    for candidate in pool:
        cand_genres = {_normalize(g) for g in (candidate.genres or []) if isinstance(g, str)}
        overlap = len(seed_set & cand_genres)
        scored.append((overlap, candidate.popularity or 0, candidate.vote_average or 0, candidate))
    scored.sort(key=lambda t: (-t[0], -t[1], -t[2]))
    return [c for _, _, _, c in scored[:CONTEXT_LIMIT]]


def _extract_keywords(message: str) -> list[str]:
    """Palabras clave (no stopword, no género) para buscar en el overview."""
    tokens = re.findall(r'[a-z0-9]+', _normalize(message))
    genre_words = {_normalize(g) for g in GENRE_SYNONYMS.values()}
    keywords = [
        t for t in tokens
        if t not in _STOPWORDS and t not in genre_words and not t.isdigit() and len(t) >= 4
    ]
    return keywords


def retrieve_candidates(message: str, user_id: int | None = None) -> dict:
    """Devuelve {seed, candidates, matched}.

    - `seed` es la película de referencia detectada (o None).
    - `candidates` son las películas reales que se pasan al modelo.
    - `matched` indica si se encontró contexto realmente relacionado con la
      consulta (False → Gemini debe decir que no encontró).
    """
    genres = _detect_genres(message)
    decade = _detect_decade(message)

    # 1) Seed EXACTO por título → recomendar por solapamiento de géneros.
    exact_seeds = _find_seed_movies_exact(message)
    if exact_seeds:
        seed = exact_seeds[0]
        candidates = _candidates_by_genre_overlap(seed)
        if candidates:
            return {'seed': seed, 'candidates': candidates, 'matched': True}

    # 2) Filtro por género y/o década.
    if genres or decade:
        qs = Movie.objects.filter(is_active=True)
        if decade:
            qs = qs.filter(release_year__gte=decade[0], release_year__lte=decade[1])
        if genres:
            q = Q()
            for genre in genres:
                q |= Q(genres__contains=[genre])
            qs = qs.filter(q)
        candidates = list(qs.order_by('-popularity', '-vote_average')[:CONTEXT_LIMIT])
        if candidates:
            return {'seed': None, 'candidates': candidates, 'matched': True}

    # 3) Seed DIFUSO por título (solo si no hubo género/década).
    fuzzy_seeds = _find_seed_movies_fuzzy(message)
    if fuzzy_seeds:
        seed = fuzzy_seeds[0]
        candidates = _candidates_by_genre_overlap(seed)
        if candidates:
            return {'seed': seed, 'candidates': candidates, 'matched': True}

    # 4) Fallback por palabras clave en el overview.
    keywords = _extract_keywords(message)
    if keywords:
        q = Q()
        for kw in keywords:
            q |= Q(overview__icontains=kw)
        candidates = list(
            Movie.objects.filter(is_active=True).filter(q)
            .order_by('-popularity', '-vote_average')[:CONTEXT_LIMIT]
        )
        if candidates:
            return {'seed': None, 'candidates': candidates, 'matched': True}

    # 5) Hubo intención específica pero nada matcheó.
    has_intent = bool(exact_seeds or fuzzy_seeds or genres or decade or keywords)
    if has_intent:
        seed = (exact_seeds or fuzzy_seeds)
        return {
            'seed': seed[0] if seed else None,
            'candidates': [],
            'matched': False,
        }

    # 6) Consulta genérica: populares como contexto base.
    candidates = list(
        Movie.objects.filter(is_active=True, popularity__gt=0)
        .order_by('-popularity', '-vote_average')[:CONTEXT_LIMIT]
    )
    return {'seed': None, 'candidates': candidates, 'matched': True}
