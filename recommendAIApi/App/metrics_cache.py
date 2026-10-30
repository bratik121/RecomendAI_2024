"""Caché de la respuesta del dashboard de métricas.

La vista `MetricsOverviewView` cachea su respuesta completa por rango. La
invalidación se hace por "generación": una clave global que se incrementa cada
vez que cambian los datos relevantes (películas, interacciones, comentarios,
usuarios y watchlist), de modo que las claves viejas dejan de leerse sin
necesidad de borrarlas una a una (no existe borrado por prefijo en LocMem/Redis).

El TTL sigue actuando como red de seguridad por si una invalidación se omite
(por ejemplo, ante operaciones masivas que no disparan señales).
"""

from __future__ import annotations

from django.conf import settings
from django.core.cache import cache

_VERSION_KEY = 'metrics:version'


def _version() -> int:
    value = cache.get(_VERSION_KEY)
    if value is None:
        # Semilla determinista; se incrementa en cada invalidación.
        value = 1
        cache.set(_VERSION_KEY, value, timeout=None)
    return int(value)


def get(range_key: str):
    """Devuelve la respuesta cacheada para un rango, o None."""
    key = _key(range_key)
    return cache.get(key)


def set(range_key: str, data) -> None:
    """Guarda la respuesta para un rango con el TTL configurado."""
    cache.set(_key(range_key), data, timeout=settings.METRICS_CACHE_TTL_SECONDS)


def _key(range_key: str) -> str:
    return f'metrics:overview:{_version()}:{range_key}'


def invalidate() -> None:
    """Invalida todas las respuestas cacheadas de métricas.

    Debe llamarse dentro de `transaction.on_commit` para no invalidar antes de
    que la transacción se confirme.
    """
    try:
        cache.incr(_VERSION_KEY)
    except ValueError:
        # La clave no existía; la inicializamos en 2 para marcar el cambio.
        cache.set(_VERSION_KEY, 2, timeout=None)
