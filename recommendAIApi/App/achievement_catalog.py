"""Catálogo de logros y rangos de RecomendAI.

Este módulo es la única fuente de verdad para:
- Los 30 logros (6 categorías × 5 hitos).
- Los rangos con sus umbrales y colores semánticos.

El catálogo se materializa en la base de datos mediante una migración de datos
(`App/migrations/0008_...`). Las reglas de desbloqueo se calculan en
`App/achievement_service.py` comparando el campo `target` de cada logro contra
las estadísticas del usuario.
"""

from __future__ import annotations

#: (categoría, icono) → lista de hitos (umbrales crecientes).
#: Las claves de logro se generan como `{category}_{target}`.
CATALOG = {
    'ratings': {
        'icon': 'Star',
        'label': 'Ratings',
        'thresholds': [1, 10, 25, 50, 100],
    },
    'comments': {
        'icon': 'MessageCircle',
        'label': 'Comentarios',
        'thresholds': [1, 5, 10, 25, 50],
    },
    'watchlist': {
        'icon': 'Bookmark',
        'label': 'Watchlist',
        'thresholds': [5, 10, 25, 50, 100],
    },
    'chat': {
        'icon': 'Bot',
        'label': 'Chat',
        'thresholds': [3, 10, 25, 50, 100],
    },
    'seen': {
        'icon': 'Eye',
        'label': 'Vistas',
        'thresholds': [10, 25, 50, 100, 250],
    },
    'likes': {
        'icon': 'Heart',
        'label': 'Likes',
        'thresholds': [10, 25, 50, 100, 250],
    },
}

#: Rangos ordenados de menor a mayor. `min` es inclusive.
RANKS = [
    {'key': 'novato', 'label': 'Novato', 'min': 0, 'color': 'rank-novato'},
    {'key': 'explorador', 'label': 'Explorador', 'min': 3, 'color': 'rank-explorador'},
    {'key': 'cinefilo', 'label': 'Cinéfilo', 'min': 6, 'color': 'rank-cinefilo'},
    {'key': 'critico', 'label': 'Crítico', 'min': 11, 'color': 'rank-critico'},
    {'key': 'maestro', 'label': 'Maestro', 'min': 16, 'color': 'rank-maestro'},
]

#: Cupo de consultas al chat por rango. La clave especial `daily` se aplica
#: cuando el rango es Maestro (límite diario en lugar de límite por rango).
CHAT_QUOTA_LIMITS = {
    'novato': {'type': 'rank', 'limit': 5},
    'explorador': {'type': 'rank', 'limit': 10},
    'cinefilo': {'type': 'rank', 'limit': 15},
    'critico': {'type': 'rank', 'limit': 20},
    'maestro': {'type': 'daily', 'limit': 10},
}


def build_catalog():
    """Devuelve la lista plana de definiciones de logros.

    Cada elemento es un dict con los campos que espera el modelo `Achievement`,
    incluyendo `name`/`description` (es) y `name_en`/`description_en` (en), con
    el `target` ya interpolado.
    """
    rows = []
    for category, meta in CATALOG.items():
        for i, target in enumerate(meta['thresholds']):
            name = _names.get(category, {}).get(target, f'{meta["label"]} {target}')
            name_en = _names_en.get(category, {}).get(target, f'{meta["label"]} {target}')
            desc_tpl = _descriptions.get(category, '{target}')
            desc_en_tpl = _descriptions_en.get(category, '{target}')
            rows.append(
                {
                    'key': f'{category}_{target}',
                    'category': category,
                    'name': name,
                    'description': desc_tpl.format(target=target),
                    'name_en': name_en,
                    'description_en': desc_en_tpl.format(target=target),
                    'icon': meta['icon'],
                    'target': target,
                    'order': i,
                }
            )
    return rows


# Nombre y descripción por hito (legibles, en español).
_names = {
    'ratings': {
        1: 'Primera calificación',
        10: 'Buen ojo',
        25: 'Crítico en ciernes',
        50: 'Voz con criterio',
        100: 'Curador de cine',
    },
    'comments': {
        1: 'Primer comentario',
        5: 'Conversador',
        10: 'Opinador frecuente',
        25: 'Referente de sala',
        50: 'Cronista de cine',
    },
    'watchlist': {
        5: 'Para ver',
        10: 'Cola creciente',
        25: 'Planificador',
        50: 'Coleccionista',
        100: 'Biblioteca personal',
    },
    'chat': {
        3: 'Primer diálogo',
        10: 'Conversación cinéfila',
        25: 'Asiduo del chat',
        50: 'Compañero de IA',
        100: 'Embajador del chat',
    },
    'seen': {
        10: 'Primeras funciones',
        25: 'Maratonista',
        50: 'Sala llena',
        100: 'Cine de cabecera',
        250: 'Enciclopedia andante',
    },
    'likes': {
        10: 'Señal de gusto',
        25: 'Gusto definido',
        50: 'Colección apreciada',
        100: 'Taste-maker',
        250: 'Leyenda del like',
    },
}

_descriptions = {
    'ratings': 'Calificaste {target} películas.',
    'comments': 'Escribiste {target} comentarios.',
    'watchlist': 'Agregaste {target} películas a tu watchlist.',
    'chat': 'Intercambiaste {target} mensajes con el asistente.',
    'seen': 'Marcaste {target} películas como vistas.',
    'likes': 'Le diste me gusta a {target} películas.',
}


# Nombre y descripción por hito en inglés.
_names_en = {
    'ratings': {
        1: 'First rating', 10: 'Good eye', 25: 'Budding critic',
        50: 'Voice with taste', 100: 'Film curator',
    },
    'comments': {
        1: 'First comment', 5: 'Conversationalist', 10: 'Frequent reviewer',
        25: 'Room authority', 50: 'Film chronicler',
    },
    'watchlist': {
        5: 'To watch', 10: 'Growing queue', 25: 'Planner',
        50: 'Collector', 100: 'Personal library',
    },
    'chat': {
        3: 'First chat', 10: 'Cinephile chat', 25: 'Chat regular',
        50: 'AI companion', 100: 'Chat ambassador',
    },
    'seen': {
        10: 'First screenings', 25: 'Marathoner', 50: 'Full house',
        100: 'Signature cinema', 250: 'Walking encyclopedia',
    },
    'likes': {
        10: 'Sign of taste', 25: 'Defined taste', 50: 'Appreciated collection',
        100: 'Taste-maker', 250: 'Like legend',
    },
}

_descriptions_en = {
    'ratings': 'You rated {target} movies.',
    'comments': 'You wrote {target} comments.',
    'watchlist': 'You added {target} movies to your watchlist.',
    'chat': 'You exchanged {target} messages with the assistant.',
    'seen': 'You marked {target} movies as seen.',
    'likes': 'You liked {target} movies.',
}


def get_rank(unlocked_count: int) -> dict:
    """Devuelve el dict del rango actual para una cantidad de logros."""
    current = RANKS[0]
    for rank in RANKS:
        if unlocked_count >= rank['min']:
            current = rank
    return current


def get_rank_by_key(key: str) -> dict:
    """Devuelve el dict del rango por su clave (default: Novato)."""
    for rank in RANKS:
        if rank['key'] == key:
            return rank
    return RANKS[0]


def next_rank(unlocked_count: int) -> dict | None:
    """Devuelve el siguiente rango o None si ya es Maestro."""
    current = get_rank(unlocked_count)
    for i, rank in enumerate(RANKS):
        if rank['key'] == current['key'] and i + 1 < len(RANKS):
            return RANKS[i + 1]
    return None
