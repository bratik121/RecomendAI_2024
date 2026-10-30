from django.test import TestCase

from App.models import Interaction, Movie, User
from App.recommendation.catalog import invalidate_catalog_cache


class RecommendationCacheTests(TestCase):
    def setUp(self):
        invalidate_catalog_cache()
        self.user = User.objects.create_user(
            email='rec@example.com', password='secret123', name='Rec', lastname='User'
        )
        self.movies = [
            Movie.objects.create(
                title=f'Movie {index}',
                poster_path=f'/poster-{index}.jpg',
                release_year='2024',
                overview='Overview',
                popularity=index / 10,
                vote_average=0.5,
                revenue=0.1,
                genres=['Action'] if index % 2 else ['Comedy'],
            )
            for index in range(1, 13)
        ]

    def test_recommendations_are_cached_and_invalidated(self):
        Interaction.objects.create(user=self.user, movie=self.movies[0], liked=True, seen=True)

        first = self.client.get(f'/api/recommend/{self.user.id}/')
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first['X-Recommend-Cache'], 'MISS')
        self.assertEqual(len(first.json()), 10)

        second = self.client.get(f'/api/recommend/{self.user.id}/')
        self.assertEqual(second['X-Recommend-Cache'], 'HIT')

        Interaction.objects.create(
            user=self.user, movie=self.movies[1], liked=False, seen=True
        )

        third = self.client.get(f'/api/recommend/{self.user.id}/')
        self.assertEqual(third['X-Recommend-Cache'], 'MISS')

    def test_rate_movies_invalidates_cache(self):
        self.client.get(f'/api/recommend/{self.user.id}/')
        response = self.client.post(
            '/api/rateMovies',
            {
                'id_user': self.user.id,
                'reviews': [{'id_movie': self.movies[1].id, 'like': True}],
            },
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)

        next_response = self.client.get(f'/api/recommend/{self.user.id}/')
        self.assertEqual(next_response['X-Recommend-Cache'], 'MISS')

    def test_zero_interactions_returns_recommendations(self):
        response = self.client.get(f'/api/recommend/{self.user.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 10)
