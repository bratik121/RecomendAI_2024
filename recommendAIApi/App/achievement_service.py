"""Lógica de logros y rangos.

Los logros se calculan comparando estadísticas del usuario (ratings, comentarios,
watchlist, chat, vistas y likes) contra el campo `target` de cada logro. El
desbloqueo es idempotente: solo se crea la fila `UserAchievement` cuando se cruza
el umbral y no existía.

`evaluate_achievements` se llama desde las vistas que registran actividad
(rating, comentario, watchlist, chat, likes, vistas) y también puede invocarse
desde el endpoint de logros como re-sincronización de seguridad.
"""

from __future__ import annotations

import logging

from django.db.models import Count, Q

from App import achievement_catalog
from App.models import Achievement, ChatMessage, Comment, Interaction, User, UserAchievement, WatchlistItem

logger = logging.getLogger(__name__)


def sync_catalog() -> None:
    """Crea los logros que falten del catálogo (idempotente)."""
    for row in achievement_catalog.build_catalog():
        Achievement.objects.get_or_create(key=row['key'], defaults=row)


def _stats(user_id: int) -> dict:
    """Calcula las estadísticas que alimentan las reglas de logros."""
    return {
        'ratings': Interaction.objects.filter(user_id=user_id, rating__isnull=False).count(),
        'comments': Comment.objects.filter(user_id=user_id, is_deleted=False).count(),
        'watchlist': WatchlistItem.objects.filter(user_id=user_id).count(),
        'chat': ChatMessage.objects.filter(conversation__user_id=user_id, role='user').count(),
        'seen': Interaction.objects.filter(user_id=user_id, seen=True).count(),
        'likes': Interaction.objects.filter(user_id=user_id, liked=True).count(),
    }


def evaluate_achievements(user_id: int) -> int:
    """Evalúa y desbloquea los logros del usuario. Devuelve los nuevos desbloqueos."""
    sync_catalog()
    stats = _stats(user_id)
    achievements = Achievement.objects.filter(is_active=True)
    existing = set(
        UserAchievement.objects.filter(user_id=user_id).values_list('achievement_id', flat=True)
    )

    new_unlocks = 0
    for achievement in achievements:
        if achievement.id in existing:
            continue
        if stats.get(achievement.category, 0) >= achievement.target:
            UserAchievement.objects.get_or_create(user_id=user_id, achievement=achievement)
            new_unlocks += 1
            logger.info('Logro desbloqueado user=%s achievement=%s', user_id, achievement.key)

    return new_unlocks


def unlocked_count(user_id: int) -> int:
    return UserAchievement.objects.filter(user_id=user_id).count()


def get_summary(user_id: int) -> dict:
    """Devuelve el resumen completo para la página de logros."""
    sync_catalog()
    evaluate_achievements(user_id)

    achievements = Achievement.objects.filter(is_active=True)
    unlocked = UserAchievement.objects.filter(user_id=user_id).select_related('achievement')
    unlocked_by_id = {ua.achievement_id: ua for ua in unlocked}
    count = len(unlocked)

    rank = achievement_catalog.get_rank(count)
    nxt = achievement_catalog.next_rank(count)

    def _progress(target: int, category: str, stats: dict) -> int:
        return min(target, stats.get(category, 0))

    stats = _stats(user_id)
    achievements_data = [
        {
            'key': a.key,
            'name': a.name,
            'description': a.description,
            'icon': a.icon,
            'category': a.category,
            'target': a.target,
            'unlocked': a.id in unlocked_by_id,
            'unlocked_at': unlocked_by_id[a.id].unlocked_at if a.id in unlocked_by_id else None,
            'progress': _progress(a.target, a.category, stats),
        }
        for a in achievements
    ]

    return {
        'unlocked_count': count,
        'total_count': achievements.count(),
        'rank': {
            'key': rank['key'],
            'label': rank['label'],
            'color': rank['color'],
            'next_threshold': nxt['min'] if nxt else None,
            'next_label': nxt['label'] if nxt else None,
            'next_color': nxt['color'] if nxt else None,
            'progress': count,
        },
        'achievements': achievements_data,
    }
