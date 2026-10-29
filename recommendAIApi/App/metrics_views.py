"""Métricas agregadas para el panel de administración.

Todas las agregaciones se calculan con queries de Django (aggregate/annotate),
no con loops en Python sobre el total de registros.
"""

from collections import Counter
from datetime import timedelta

from django.db.models import Avg, Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment, Interaction, Movie, User
from .permissions import IsAppAdmin
from . import metrics_cache

RANGE_DAYS = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    'all': None,
}


class MetricsOverviewView(APIView):
    permission_classes = [IsAppAdmin]

    def _since(self, range_key):
        days = RANGE_DAYS.get(range_key, 30)
        if days is None:
            return None
        return timezone.now() - timedelta(days=days)

    def _series(self, qs, field):
        """Devuelve [{date, count}] agrupado por día."""
        return [
            {'date': row['day'].isoformat(), 'count': row['count']}
            for row in (
                qs.annotate(day=TruncDate(field)).values('day').annotate(count=Count('id')).order_by('day')
            )
        ]

    def get(self, request):
        range_key = request.query_params.get('range', '30d')

        cached = metrics_cache.get(range_key)
        if cached is not None:
            return Response(cached)

        since = self._since(range_key)

        def in_range(qs):
            return qs if since is None else qs.filter(created_at__gte=since)

        kpis = {
            'users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'movies': Movie.objects.filter(is_active=True).count(),
            'comments': Comment.objects.count(),
            'ratings': Interaction.objects.filter(rating__isnull=False).count(),
        }

        registrations = self._series(in_range(User.objects.all()), 'created_at')

        comments_series = self._series(in_range(Comment.objects.all()), 'created_at')

        # Interacciones: no hay `created_at` histórico; usamos la fecha de rating.
        interactions = self._series(
            Interaction.objects.filter(rated_at__isnull=False),
            'rated_at',
        )

        top_seen = [
            {'movie_id': row['movie_id'], 'title': row['movie__title'], 'count': row['count']}
            for row in (
                Interaction.objects.filter(seen=True, movie__is_active=True)
                .values('movie_id', 'movie__title')
                .annotate(count=Count('id'))
                .order_by('-count')[:10]
            )
        ]

        rating_distribution = [
            {'rating': row['rating'], 'count': row['count']}
            for row in (
                Interaction.objects.filter(rating__isnull=False)
                .values('rating')
                .annotate(count=Count('id'))
                .order_by('rating')
            )
        ]

        # Géneros: se lee el JSONField por lotes y se cuenta en memoria.
        # Evita depender de operadores JSON específicos de Postgres y no
        # materializa todo el catálogo de una vez.
        genre_counter = Counter()
        genre_rows = (
            Movie.objects.filter(is_active=True)
            .values_list('genres', flat=True)
            .iterator(chunk_size=2000)
        )
        for genres in genre_rows:
            if isinstance(genres, list):
                for genre in genres:
                    if genre:
                        genre_counter[str(genre)] += 1
        popular_genres = [
            {'genre': genre, 'count': count}
            for genre, count in genre_counter.most_common(10)
        ]

        data = {
            'range': range_key,
            'kpis': kpis,
            'registrations': registrations,
            'interactions': interactions,
            'top_seen_movies': top_seen,
            'rating_distribution': rating_distribution,
            'popular_genres': popular_genres,
            'comments': comments_series,
            'note': (
                'Las series de registros e interacciones solo reflejan datos a partir de '
                'su instrumentación; los usuarios preexistentes comparten fecha de migración.'
            ),
        }
        metrics_cache.set(range_key, data)
        return Response(data)
