"""Invalidación de la caché de métricas ante cambios en los datos.

Cubre los modelos que alimentan el dashboard: usuarios, películas,
interacciones, comentarios y watchlist. La invalidación se ejecuta al confirmar
la transacción para no invalidar antes de que el cambio sea visible.
"""

from __future__ import annotations

from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from App import metrics_cache
from App.models import Comment, Interaction, Movie, User, WatchlistItem


def _invalidate_on_commit():
    transaction.on_commit(metrics_cache.invalidate)


@receiver(post_save, sender=User)
@receiver(post_delete, sender=User)
@receiver(post_save, sender=Movie)
@receiver(post_delete, sender=Movie)
@receiver(post_save, sender=Interaction)
@receiver(post_delete, sender=Interaction)
@receiver(post_save, sender=Comment)
@receiver(post_delete, sender=Comment)
@receiver(post_save, sender=WatchlistItem)
@receiver(post_delete, sender=WatchlistItem)
def invalidate_metrics_cache(sender, instance, **kwargs):
    _invalidate_on_commit()
