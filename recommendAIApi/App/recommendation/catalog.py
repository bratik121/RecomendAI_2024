"""Cache en memoria de la matriz de features del catálogo.

La matriz se construye una sola vez por proceso. Solo se reconstruye cuando
cambia la versión del catálogo o la versión del recomendador.
"""

from __future__ import annotations

import logging
import threading
from dataclasses import dataclass

import numpy as np
from django.conf import settings
from sklearn.preprocessing import MultiLabelBinarizer

from App.models import CatalogState, Movie

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class CatalogFeatures:
    movie_ids: np.ndarray
    matrix: np.ndarray
    genre_columns: tuple[str, ...]
    catalog_version: int
    recommender_version: str


_lock = threading.Lock()
_cache: CatalogFeatures | None = None


def _normalize_genres(genres) -> list[str]:
    if isinstance(genres, list):
        return [str(genre) for genre in genres if genre]
    if isinstance(genres, str):
        return [part.strip() for part in genres.split(',') if part.strip()]
    return ['Unknown']


def _build_features(catalog_version: int) -> CatalogFeatures:
    rows = list(
        Movie.objects.order_by('id').values_list(
            'id', 'genres', 'popularity', 'vote_average', 'revenue'
        )
    )
    if not rows:
        return CatalogFeatures(
            movie_ids=np.array([], dtype=np.int32),
            matrix=np.empty((0, 0), dtype=np.float32),
            genre_columns=(),
            catalog_version=catalog_version,
            recommender_version=settings.RECOMMENDER_VERSION,
        )

    movie_ids = np.fromiter((row[0] for row in rows), dtype=np.int32, count=len(rows))
    genres = [_normalize_genres(row[1]) for row in rows]
    numeric = np.fromiter(
        (value for row in rows for value in row[2:5]),
        dtype=np.float32,
        count=len(rows) * 3,
    ).reshape(len(rows), 3)

    mlb = MultiLabelBinarizer()
    encoded = mlb.fit_transform(genres).astype(np.float32, copy=False)

    matrix = np.empty((len(rows), 3 + encoded.shape[1]), dtype=np.float32)
    matrix[:, :3] = numeric
    matrix[:, 3:] = encoded

    logger.info(
        'Catálogo construido: %s películas, %s features, versión %s',
        len(rows),
        matrix.shape[1],
        catalog_version,
    )
    return CatalogFeatures(
        movie_ids=movie_ids,
        matrix=matrix,
        genre_columns=tuple(str(column) for column in mlb.classes_),
        catalog_version=catalog_version,
        recommender_version=settings.RECOMMENDER_VERSION,
    )


def get_catalog_features() -> CatalogFeatures:
    """Devuelve la matriz cacheada, reconstruyéndola si cambió la versión."""

    global _cache

    catalog_version = CatalogState.get_version()
    recommender_version = settings.RECOMMENDER_VERSION
    cached = _cache

    if (
        cached is not None
        and cached.catalog_version == catalog_version
        and cached.recommender_version == recommender_version
    ):
        return cached

    with _lock:
        cached = _cache
        if (
            cached is not None
            and cached.catalog_version == catalog_version
            and cached.recommender_version == recommender_version
        ):
            return cached

        _cache = _build_features(catalog_version)
        return _cache


def invalidate_catalog_cache() -> None:
    global _cache
    with _lock:
        _cache = None
