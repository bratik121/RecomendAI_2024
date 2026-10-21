"""Entrenamiento y scoring del recomendador content-based."""

from __future__ import annotations

import hashlib
import logging

import numpy as np
from sklearn.ensemble import RandomForestClassifier

from App.models import Interaction
from App.recommendation.catalog import CatalogFeatures, get_catalog_features

logger = logging.getLogger(__name__)


def interaction_fingerprint(user_id: int) -> str:
    """Hash estable del historial de interacciones del usuario."""

    digest = hashlib.sha256()
    interactions = (
        Interaction.objects.filter(user_id=user_id)
        .order_by('movie_id')
        .values_list('movie_id', 'liked', 'seen')
    )
    for movie_id, liked, seen in interactions:
        digest.update(f'{movie_id}:{int(bool(liked))}:{int(bool(seen))};'.encode())
    return digest.hexdigest()


def _positions_for_ids(catalog: CatalogFeatures, movie_ids: list[int]):
    if not movie_ids:
        return np.array([], dtype=np.int64), np.array([], dtype=bool)

    catalog_ids = catalog.movie_ids
    positions = np.searchsorted(catalog_ids, np.asarray(movie_ids, dtype=np.int32))
    clipped = np.clip(positions, 0, max(len(catalog_ids) - 1, 0))
    valid = positions < len(catalog_ids)
    if len(catalog_ids):
        valid &= catalog_ids[clipped] == np.asarray(movie_ids, dtype=np.int32)
    return positions[valid], valid


def _top_k(scores: np.ndarray, mask: np.ndarray, limit: int) -> list[int]:
    candidates = np.flatnonzero(mask)
    if candidates.size == 0:
        return []

    limit = min(limit, candidates.size)
    candidate_scores = scores[candidates]
    if limit < candidates.size:
        top = np.argpartition(-candidate_scores, limit - 1)[:limit]
    else:
        top = np.arange(candidates.size)
    top = top[np.argsort(-candidate_scores[top])]
    return candidates[top].tolist()


def compute_recommendations(user_id: int, limit: int = 20) -> list[int]:
    """Entrena el modelo del usuario y devuelve hasta ``limit`` IDs."""

    catalog = get_catalog_features()
    if not len(catalog.movie_ids):
        return []

    interactions = list(
        Interaction.objects.filter(user_id=user_id).values_list(
            'movie_id', 'liked', 'seen'
        )
    )

    y = np.zeros(len(catalog.movie_ids), dtype=np.int8)
    seen_mask = np.zeros(len(catalog.movie_ids), dtype=bool)

    if interactions:
        interaction_ids = [row[0] for row in interactions]
        positions, valid = _positions_for_ids(catalog, interaction_ids)
        liked = np.asarray([row[1] for row in interactions], dtype=np.int8)
        y[positions] = liked[valid]
        seen_mask[positions] = True

    # Sin historial no hay señal para entrenar: devolvemos las más populares.
    if not bool(seen_mask.any()):
        popularity = catalog.matrix[:, 0]
        top_positions = _top_k(
            popularity, np.ones(len(popularity), dtype=bool), limit
        )
        return catalog.movie_ids[top_positions].tolist()

    model = RandomForestClassifier(
        n_estimators=50,
        n_jobs=-1,
        random_state=42,
    )
    model.fit(catalog.matrix, y)
    probabilities = model.predict_proba(catalog.matrix)

    if probabilities.shape[1] == 1:
        if model.classes_[0] == 1:
            probabilities = np.column_stack([1 - probabilities, probabilities])
        else:
            probabilities = np.column_stack([probabilities, 1 - probabilities])

    scores = probabilities[:, 1]
    unseen_mask = ~seen_mask
    top_positions = _top_k(scores, unseen_mask, limit)
    return catalog.movie_ids[top_positions].tolist()
