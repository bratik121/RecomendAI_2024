import statistics
import time

from django.core.management.base import BaseCommand
from django.db import connection
from django.test.utils import CaptureQueriesContext

from App.models import RecommendationCache
from App.recommendation.cache import get_recommendations


class Command(BaseCommand):
    help = 'Mide latencia y cache hits del motor de recomendaciones.'

    def add_arguments(self, parser):
        parser.add_argument('--user', type=int, default=1)
        parser.add_argument('--runs', type=int, default=5)

    def handle(self, *args, **options):
        user_id = options['user']
        runs = max(1, options['runs'])

        # Primer cálculo para separar cold start de los hits.
        RecommendationCache.objects.filter(user_id=user_id).delete()
        started = time.perf_counter()
        get_recommendations(user_id)
        cold_ms = (time.perf_counter() - started) * 1000

        timings = []
        hits = 0
        queries = []
        for _ in range(runs):
            with CaptureQueriesContext(connection) as captured:
                started = time.perf_counter()
                _, hit = get_recommendations(user_id)
                timings.append((time.perf_counter() - started) * 1000)
                queries.append(len(captured))
                hits += int(hit)

        self.stdout.write(f'Cold start: {cold_ms:.1f} ms')
        self.stdout.write(f'p50: {statistics.median(timings):.1f} ms')
        self.stdout.write(f'p95: {sorted(timings)[max(0, int(len(timings) * 0.95) - 1)]:.1f} ms')
        self.stdout.write(f'Cache hits: {hits}/{runs}')
        self.stdout.write(f'Queries promedio: {statistics.mean(queries):.1f}')
