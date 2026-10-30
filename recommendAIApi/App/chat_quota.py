"""Cupo de consultas del chat por rango.

Regla de negocio acordada:
- Novato: 5 consultas mientras permanezca en ese rango.
- Explorador: 10, Cinéfilo: 15, Crítico: 20 (también "por rango").
- Maestro: 10 consultas por día.

El contador `rank_count` se reinicia cuando el usuario cambia de rango; el
`daily_count` se reinicia cada día (solo aplica a Maestro). El consumo es
atómico: `check_and_consume` bloquea la fila y solo incrementa si hay cupo.
"""

from __future__ import annotations

from datetime import date

from django.db import transaction
from django.utils import timezone

from App import achievement_catalog
from App.models import ChatQuota


def get_rank_key(user) -> str:
    """Devuelve la clave de rango actual del usuario (override o derivado)."""
    if getattr(user, 'is_admin', False):
        return 'maestro'
    from App.achievement_service import get_user_rank
    return get_user_rank(user)['key']


def get_quota(user) -> dict:
    """Devuelve {type, limit, used, remaining} para mostrar en el frontend."""
    rank_key = get_rank_key(user)
    rule = achievement_catalog.CHAT_QUOTA_LIMITS.get(rank_key, {'type': 'rank', 'limit': 5})

    quota, _ = ChatQuota.objects.get_or_create(user=user)
    today = timezone.localdate()

    if rule['type'] == 'daily':
        used = quota.daily_count if quota.daily_date == today else 0
    else:
        used = quota.rank_count if quota.rank == rank_key else 0

    remaining = max(0, rule['limit'] - used)
    return {
        'type': rule['type'],
        'limit': rule['limit'],
        'used': used,
        'remaining': remaining,
        'rank': rank_key,
    }


def check_and_consume(user) -> tuple[bool, dict]:
    """Comprueba y consume un mensaje de forma atómica.

    Devuelve (allowed, info) donde `info` incluye remaining y limit. Si el cupo
    está agotado, no se consume nada y `allowed` es False.
    """
    rank_key = get_rank_key(user)
    rule = achievement_catalog.CHAT_QUOTA_LIMITS.get(rank_key, {'type': 'rank', 'limit': 5})
    today = timezone.localdate()

    with transaction.atomic():
        quota, _ = ChatQuota.objects.select_for_update().get_or_create(user=user)

        if rule['type'] == 'daily':
            if quota.daily_date != today:
                quota.daily_date = today
                quota.daily_count = 0
            if quota.daily_count >= rule['limit']:
                info = {
                    'type': 'daily', 'limit': rule['limit'],
                    'used': quota.daily_count,
                    'remaining': 0, 'rank': rank_key,
                }
                quota.save(update_fields=['daily_date', 'daily_count'])
                return False, info
            quota.daily_count += 1
            quota.save(update_fields=['daily_date', 'daily_count'])
            info = {
                'type': 'daily', 'limit': rule['limit'],
                'used': quota.daily_count,
                'remaining': rule['limit'] - quota.daily_count, 'rank': rank_key,
            }
            return True, info

        # Rango con cupo fijo: se reinicia si cambió el rango.
        if quota.rank != rank_key:
            quota.rank = rank_key
            quota.rank_count = 0
        if quota.rank_count >= rule['limit']:
            info = {
                'type': 'rank', 'limit': rule['limit'],
                'used': quota.rank_count,
                'remaining': 0, 'rank': rank_key,
            }
            quota.save(update_fields=['rank', 'rank_count'])
            return False, info
        quota.rank_count += 1
        quota.save(update_fields=['rank', 'rank_count'])
        info = {
            'type': 'rank', 'limit': rule['limit'],
            'used': quota.rank_count,
            'remaining': rule['limit'] - quota.rank_count, 'rank': rank_key,
        }
        return True, info
