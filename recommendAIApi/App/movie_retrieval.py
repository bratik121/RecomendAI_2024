"""Recuperación de películas para el contexto del chat (RAG textual).

En esta fase usamos búsqueda por texto (título/géneros) sobre PostgreSQL, sin
pgvector. El objetivo es acotar un conjunto de películas REALES de la tabla
`Movie` para que Gemini responda únicamente con ellas.
"""

from __future__ import annotations

from django.db.models import Count, Q

from App.models import Movie

CONTEXT_LIMIT = 8


# Mapa de sinónimos en español/inglés → nombre de género como está en la DB.
# Ajustá los valores de la derecha según cómo estén guardados tus géneros.
GENRE_SYNONYMS = {
    'animacion': 'Animation',
    'animación': 'Animation',
    'animadas': 'Animation',
    'animada': 'Animation',
    'animados': 'Animation',
    'animado': 'Animation',
    'animation': 'Animation',
    'anime': 'Animation',
    'dibujos': 'Animation',
    'infantil': 'Family',
    'infantiles': 'Family',
    'familia': 'Family',
    'family': 'Family',
    'terror': 'Horror',
    'horror': 'Horror',
    'miedo': 'Horror',
    'comedia': 'Comedy',
    'comedias': 'Comedy',
    'comedy': 'Comedy',
    'accion': 'Action',
    'acción': 'Action',
    'action': 'Action',
    'drama': 'Drama',
    'dramas': 'Drama',
    'ciencia ficcion': 'Science Fiction',
    'ciencia ficción': 'Science Fiction',
    'sci-fi': 'Science Fiction',
    'scifi': 'Science Fiction',
    'romance': 'Romance',
    'romantica': 'Romance',
    'romántica': 'Romance',
    'suspenso': 'Thriller',
    'thriller': 'Thriller',
    'misterio': 'Mystery',
    'documental': 'Documentary',
    'documentales': 'Documentary',
    'documentary': 'Documentary',
    'aventura': 'Adventure',
    'aventuras': 'Adventure',
    'adventure': 'Adventure',
    'fantasia': 'Fantasy',
    'fantasía': 'Fantasy',
    'fantasy': 'Fantasy',
    'guerra': 'War',
    'war': 'War',
    'western': 'Western',
    'musical': 'Music',
    'musica': 'Music',
    'música': 'Music',
    'crimen': 'Crime',
    'crime': 'Crime',
}


def _clean(value: str) -> str:
    return value.strip().lower()


def _normalize(value: str) -> str:
    """Minúsculas y sin tildes, para comparar de forma robusta."""
    value = _clean(value)
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'ñ': 'n', 'ü': 'u',
    }
    for src, dst in replacements.items():
        value = value.replace(src, dst)
    return value


def _detect_genres(message: str) -> list[str]:
    """Devuelve los géneros (en formato DB) mencionados en el mensaje."""
    normalized = _normalize(message)
    found = []
    for synonym, genre in GENRE_SYNONYMS.items():
        if _normalize(synonym) in normalized:
            if genre not in found:
                found.append(genre)
    print(f"Detected genres: {found}")
    return found


def _find_seed_movies(message: str):
    """Busca películas cuyo título aparezca en el mensaje del usuario."""
    normalized = _clean(message)
    active = Movie.objects.filter(is_active=True)

    title_hits = []
    for movie in active.only('id', 'title'):
        title = _clean(movie.title)
        if title and len(title) >= 3 and title in normalized:
            title_hits.append(movie)

    if title_hits:
        return title_hits

    words = [w for w in normalized.replace('?', ' ').replace('¿', ' ').split() if len(w) >= 4]
    if words:
        q = Q()
        for word in words:
            q |= Q(title__icontains=word)
        hits = list(active.filter(q).only('id', 'title')[:10])
        if hits:
            return hits

    return []


def _genre_overlap(seed, candidate) -> int:
    seed_genres = {_clean(g) for g in (seed.genres or []) if isinstance(seed.genres, list)}
    cand_genres = {_clean(g) for g in (candidate.genres or []) if isinstance(candidate.genres, list)}
    return len(seed_genres & cand_genres)


def _movie_has_genres(movie, genres: list[str]) -> bool:
    """Devuelve True si la película tiene al menos uno de los géneros dados."""
    if not isinstance(movie.genres, list):
        return False
    movie_genres = {_clean(g) for g in movie.genres if isinstance(g, str)}
    return bool(movie_genres & {_clean(g) for g in genres})


def retrieve_candidates(message: str, user_id: int | None = None) -> dict:
    """Devuelve {seed, candidates, recognized}."""
    seeds = _find_seed_movies(message)

    # Caso 1: hay una película de referencia → recomendar por solapamiento de géneros.
    if seeds:
        seed = seeds[0]
        others = Movie.objects.filter(is_active=True).exclude(id=seed.id)
        scored = []
        for candidate in others.only('id', 'title', 'genres', 'release_year', 'overview', 'popularity'):
            overlap = _genre_overlap(seed, candidate)
            if overlap == 0:
                continue
            scored.append((overlap, candidate.popularity, candidate))
        scored.sort(key=lambda t: (-t[0], -t[1]))
        candidates = [c for _, _, c in scored[:CONTEXT_LIMIT]]
        if candidates:
            return {'seed': seed, 'candidates': candidates, 'recognized': True}

    # Caso 2: no hay seed, pero el mensaje menciona un género.
    detected_genres = _detect_genres(message)
    if detected_genres:
        # Filtrar candidatas que tengan alguno de esos géneros.
        qs = Movie.objects.filter(is_active=True, popularity__gt=0)
        matched = [
            m for m in qs.only('id', 'title', 'genres', 'release_year', 'overview', 'popularity')
            if _movie_has_genres(m, detected_genres)
        ]
        matched.sort(key=lambda m: (-(m.popularity or 0), -(m.vote_average or 0)))
        candidates = matched[:CONTEXT_LIMIT]
        if candidates:
            return {'seed': None, 'candidates': candidates, 'recognized': True}

    # Caso 3: fallback → populares (solo si no se detectó nada).
    candidates = list(
        Movie.objects.filter(is_active=True, popularity__gt=0)
        .order_by('-popularity', '-vote_average')[:CONTEXT_LIMIT]
    )
    return {'seed': None, 'candidates': candidates, 'recognized': False}