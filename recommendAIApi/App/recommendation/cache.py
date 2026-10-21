"""Lectura y escritura del cache materializado de recomendaciones."""

from __future__ import annotations

import logging
import time
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from App.models import CatalogState, RecommendationCache
from App.recommendation.engine import compute_recommendations, interaction_fingerprint

logger = logging.getLogger(__name__)

CACHE_LIMIT = 20


def invalidate_recommendations(user_id: int) -> None:
    RecommendationCache.objects.filter(user_id=user_id).delete()


def _is_valid(cache: RecommendationCache, fingerprint: str, catalog_version: int) -> bool:
    if cache.interaction_hash != fingerprint:
        return False
    if cache.catalog_version != catalog_version:
        return False
    if cache.recommender_version != settings.RECOMMENDER_VERSION:
        return False

    max_age = timedelta(seconds=settings.RECOMMENDATION_CACHE_TTL_SECONDS)
    return cache.generated_at >= timezone.now() - max_age


def get_recommendations(user_id: int) -> tuple[list[int], bool]:
    """Devuelve (movie_ids, cache_hit)."""

    fingerprint = interaction_fingerprint(user_id)
    catalog_version = CatalogState.get_version()

    cache = RecommendationCache.objects.filter(user_id=user_id).first()
    if cache is not None and _is_valid(cache, fingerprint, catalog_version):
        return [int(movie_id) for movie_id in cache.movie_ids], True

    started = time.perf_counter()
    movie_ids = compute_recommendations(user_id, CACHE_LIMIT)
    elapsed_ms = int((time.perf_counter() - started) * 1000)

    # Si el usuario interactuó mientras entrenábamos, no persistimos un
    # resultado que ya nació viejo.
    current_fingerprint = interaction_fingerprint(user_id)
    if current_fingerprint == fingerprint:
        RecommendationCache.objects.update_or_create(
            user_id=user_id,
            defaults={
                'movie_ids': movie_ids,
                'interaction_hash': fingerprint,
                'catalog_version': catalog_version,
                'recommender_version': settings.RECOMMENDER_VERSION,
                'compute_ms': elapsed_ms,
            },
        )
        logger.info(
            'Recomendaciones recalculadas user=%s ms=%s cache=miss',
            user_id,
            elapsed_ms,
        )
    else:
        logger.info(
            'Interacciones cambiaron durante el cálculo user=%s; no se cachea',
            user_id,
        )

    return movie_ids, False
