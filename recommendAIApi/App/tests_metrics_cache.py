"""Tests de la caché del dashboard de métricas."""

from django.core.cache import cache
from django.test import TransactionTestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from App import metrics_cache
from App.models import Movie, User


class MetricsCacheTests(TransactionTestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com', password='secret123', name='A', lastname='Admin'
        )
        self.admin.role = 'admin'
        self.admin.is_staff = True
        self.admin.save(update_fields=['role', 'is_staff'])
        self.token = Token.objects.create(user=self.admin)
        self.client = APIClient(HTTP_HOST='localhost')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def tearDown(self):
        cache.clear()

    def test_metrics_requires_admin(self):
        plain = User.objects.create_user(
            email='user@example.com', password='secret123', name='U', lastname='User'
        )
        token = Token.objects.create(user=plain)
        client = APIClient(HTTP_HOST='localhost')
        client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        self.assertEqual(client.get('/api/admin/metrics/overview/').status_code, 403)

    def test_metrics_response_is_cached(self):
        first = self.client.get('/api/admin/metrics/overview/')
        self.assertEqual(first.status_code, 200)

        # La segunda lectura debe venir de caché.
        cached = metrics_cache.get('30d')
        self.assertIsNotNone(cached)
        self.assertEqual(cached['range'], '30d')

    def test_invalidation_bumps_version(self):
        metrics_cache.get('30d')  # fuerza la creación de la versión
        before = cache.get('metrics:version')
        metrics_cache.invalidate()
        after = cache.get('metrics:version')
        self.assertNotEqual(before, after)

    def test_movie_change_invalidates(self):
        self.client.get('/api/admin/metrics/overview/')
        version_before = cache.get('metrics:version')

        Movie.objects.create(
            title='New', poster_path='/n.jpg', release_year='2024',
            overview='o', popularity=0.5, vote_average=0.7, revenue=0.1, genres=['Drama'],
        )
        # La señal invalida al commit; en TestCase no hay transacción pendiente,
        # así que el cambio ya se aplicó.
        version_after = cache.get('metrics:version')
        self.assertNotEqual(version_before, version_after)
