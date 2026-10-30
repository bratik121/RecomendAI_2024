"""Tests de logros, rangos y cupo de chat."""

from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from App.achievement_service import get_summary, unlocked_count
from App.chat_quota import check_and_consume, get_quota
from App.models import Comment, Interaction, Movie, User, WatchlistItem


class AchievementTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='achievements@example.com',
            password='secret123',
            name='Ach',
            lastname='User',
        )
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient(HTTP_HOST='localhost')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.movies = []
        for i in range(3):
            self.movies.append(
                Movie.objects.create(
                    title=f'Movie {i}',
                    poster_path=f'/m{i}.jpg',
                    release_year='2020',
                    overview='Overview',
                    popularity=0.5,
                    vote_average=0.7,
                    revenue=0.1,
                    genres=['Drama'],
                )
            )

    def test_rating_achievement_unlocks(self):
        # Primer rating desbloquea ratings_1.
        Interaction.objects.create(
            user=self.user, movie=self.movies[0], rating=5, seen=True, liked=True
        )
        summary = get_summary(self.user.id)
        ratings = next(a for a in summary['achievements'] if a['key'] == 'ratings_1')
        self.assertTrue(ratings['unlocked'])
        self.assertEqual(summary['unlocked_count'], unlocked_count(self.user.id))

    def test_rank_progression(self):
        # 10 ratings desbloquean ratings_1 y ratings_10; un comentario agrega
        # comments_1. En total 3 logros → Explorador.
        for movie in self.movies:
            Interaction.objects.create(user=self.user, movie=movie, rating=5, seen=True, liked=True)
        for i in range(7):
            extra = Movie.objects.create(
                title=f'Extra {i}', poster_path=f'/e{i}.jpg', release_year='2020',
                overview='Overview', popularity=0.5, vote_average=0.7, revenue=0.1,
                genres=['Drama'],
            )
            Interaction.objects.create(user=self.user, movie=extra, rating=5, seen=True, liked=True)
        Comment.objects.create(user=self.user, movie=self.movies[0], body='Buenisima')

        summary = get_summary(self.user.id)
        self.assertEqual(summary['rank']['key'], 'explorador')

    def test_achievements_endpoint_requires_auth(self):
        anon = APIClient(HTTP_HOST='localhost')
        self.assertEqual(anon.get('/api/achievements/').status_code, 401)

    def test_achievements_endpoint_returns_summary(self):
        response = self.client.get('/api/achievements/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('rank', response.data)
        self.assertIn('achievements', response.data)


class ChatQuotaTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='quota@example.com', password='secret123', name='Q', lastname='User'
        )

    def test_novato_rank_quota(self):
        # Un usuario nuevo es Novato: 5 consultas máximas.
        for _ in range(5):
            allowed, info = check_and_consume(self.user)
            self.assertTrue(allowed, info)
        allowed, info = check_and_consume(self.user)
        self.assertFalse(allowed)
        self.assertEqual(info['remaining'], 0)
        self.assertEqual(info['limit'], 5)

    def test_quota_info_shape(self):
        info = get_quota(self.user)
        self.assertEqual(info['rank'], 'novato')
        self.assertEqual(info['limit'], 5)
        self.assertEqual(info['remaining'], 5)
