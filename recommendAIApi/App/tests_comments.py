from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from App.models import Comment, Movie, User


class CommentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='author@example.com', password='secret123', name='Author', lastname='One'
        )
        self.other = User.objects.create_user(
            email='other@example.com', password='secret123', name='Other', lastname='Two'
        )
        self.movie = Movie.objects.create(
            title='Commented Movie',
            poster_path='/commented.jpg',
            release_year='2022',
            overview='A movie',
            popularity=0.3,
            vote_average=0.7,
            revenue=0.1,
            genres=['Drama'],
        )
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.url = f'/api/movies/{self.movie.id}/comments/'

    def authenticate(self, user=None, token=None):
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Token {(token or self.token).key}'
        )

    def test_anonymous_can_read_but_not_write(self):
        self.assertEqual(self.client.get(self.url).status_code, 200)
        response = self.client.post(self.url, {'body': 'Hola'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_create_and_reply(self):
        self.authenticate()
        root = self.client.post(self.url, {'body': 'Comentario raíz'}, format='json')
        self.assertEqual(root.status_code, 201)

        reply = self.client.post(
            self.url,
            {'body': 'Una respuesta', 'parent': root.data['id']},
            format='json',
        )
        self.assertEqual(reply.status_code, 201)
        self.assertEqual(reply.data['parent'], root.data['id'])

    def test_nested_reply_is_rejected(self):
        self.authenticate()
        root = self.client.post(self.url, {'body': 'Raíz'}, format='json')
        reply = self.client.post(
            self.url,
            {'body': 'Respuesta', 'parent': root.data['id']},
            format='json',
        )
        nested = self.client.post(
            self.url,
            {'body': 'Respuesta anidada', 'parent': reply.data['id']},
            format='json',
        )
        self.assertEqual(nested.status_code, 400)

    def test_only_author_can_edit_and_delete(self):
        self.authenticate()
        root = self.client.post(self.url, {'body': 'Mi comentario'}, format='json')

        other_token = Token.objects.create(user=self.other)
        self.authenticate(self.other, other_token)
        self.assertEqual(
            self.client.patch(
                f'/api/comments/{root.data["id"]}/',
                {'body': 'Editado por otro'},
                format='json',
            ).status_code,
            403,
        )

        self.authenticate()
        self.assertEqual(
            self.client.patch(
                f'/api/comments/{root.data["id"]}/',
                {'body': 'Editado'},
                format='json',
            ).status_code,
            200,
        )
        self.assertEqual(
            self.client.delete(f'/api/comments/{root.data["id"]}/').status_code, 204
        )
        self.assertTrue(
            Comment.objects.get(pk=root.data['id']).is_deleted
        )

    def test_body_validation(self):
        self.authenticate()
        response = self.client.post(self.url, {'body': ' '}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_comments_are_paginated(self):
        for index in range(11):
            Comment.objects.create(
                movie=self.movie,
                user=self.user,
                body=f'Comentario {index}',
            )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 10)
        self.assertIsNotNone(response.data['next'])
