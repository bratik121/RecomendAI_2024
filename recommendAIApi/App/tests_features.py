from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from App.models import Comment, Interaction, Movie, User, WatchlistItem


class FeatureTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='feature@example.com', password='secret123', name='Feature', lastname='User'
        )
        self.token = Token.objects.create(user=self.user)
        self.movie = Movie.objects.create(
            title='Feature Movie',
            poster_path='/feature.jpg',
            release_year='2024',
            overview='Overview',
            popularity=0.5,
            vote_average=0.7,
            revenue=0.1,
            genres=['Drama'],
        )
        self.client = APIClient(HTTP_HOST='localhost')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_watchlist_flow(self):
        response = self.client.post('/api/watchlist/', {'movie_id': self.movie.id}, format='json')
        self.assertEqual(response.status_code, 201)
        item_id = response.data['id']

        duplicate = self.client.post('/api/watchlist/', {'movie_id': self.movie.id}, format='json')
        self.assertEqual(duplicate.status_code, 400)

        self.assertEqual(self.client.get('/api/watchlist/summary/').json()['pending'], 1)

        patched = self.client.patch(f'/api/watchlist/{item_id}/', {'watched': True}, format='json')
        self.assertEqual(patched.status_code, 200)
        self.assertTrue(patched.data['watched'])

        self.assertEqual(self.client.delete(f'/api/watchlist/{item_id}/').status_code, 204)
        self.assertFalse(WatchlistItem.objects.filter(pk=item_id).exists())

    def test_rating_flow_and_aggregate(self):
        created = self.client.post('/api/ratings/', {'movie': self.movie.id, 'score': 5}, format='json')
        self.assertEqual(created.status_code, 201)
        rating_id = created.data['id']

        updated = self.client.patch(f'/api/ratings/{rating_id}/', {'score': 3}, format='json')
        self.assertEqual(updated.status_code, 200)

        aggregate = self.client.get(f'/api/movies/{self.movie.id}/ratings/').json()
        self.assertEqual(aggregate['average'], 3.0)
        self.assertEqual(aggregate['user_rating']['score'], 3)

    def test_profile_patch(self):
        response = self.client.patch(
            '/api/profile/', {'bio': 'Hola', 'name': 'Nuevo'}, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['bio'], 'Hola')
        self.assertEqual(response.data['name'], 'Nuevo')

    def test_comment_social_indicators(self):
        Interaction.objects.create(
            user=self.user, movie=self.movie, liked=True, seen=True, rating=4
        )
        self.client.post(
            f'/api/movies/{self.movie.id}/comments/',
            {'body': 'Comentario'},
            format='json',
        )
        comments = self.client.get(f'/api/movies/{self.movie.id}/comments/').json()
        first = comments['results'][0]
        self.assertTrue(first['author_liked'])
        self.assertEqual(first['author_rating'], 4)

    def test_rating_requires_auth(self):
        anonymous = APIClient(HTTP_HOST='localhost')
        response = anonymous.post(
            '/api/ratings/', {'movie': self.movie.id, 'score': 5}, format='json'
        )
        self.assertEqual(response.status_code, 401)
