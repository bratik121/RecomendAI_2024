"""Invalidación del catálogo cuando cambian películas."""

from __future__ import annotations

import threading
from contextlib import contextmanager

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from App.models import CatalogState, Movie

_state = threading.local()


def _bumps_suppressed() -> bool:
    return getattr(_state, 'suppress', False)


@contextmanager
def suppress_catalog_bumps():
    previous = _bumps_suppressed()
    _state.suppress = True
    try:
        yield
    finally:
        _state.suppress = previous


@receiver(post_save, sender=Movie)
@receiver(post_delete, sender=Movie)
def bump_catalog_version(sender, instance, **kwargs):
    if _bumps_suppressed():
        return
    CatalogState.bump()
