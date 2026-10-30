from django.test import TestCase

from App.models import Movie


class MovieDetailTests(TestCase):
    def setUp(self):
        self.movie = Movie.objects.create(
            title='Detail Movie',
            poster_path='/detail.jpg',
            release_year='2023',
            overview='A movie',
            popularity=0.4,
            vote_average=0.8,
            revenue=0.2,
            genres=['Drama', 'Thriller'],
        )

    def test_detail_returns_all_fields(self):
        response = self.client.get(f'/api/movies/{self.movie.id}/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['title'], 'Detail Movie')
        self.assertEqual(data['genres'], ['Drama', 'Thriller'])
        self.assertIn('popularity', data)
        self.assertIn('revenue', data)

    def test_missing_movie_returns_404(self):
        response = self.client.get('/api/movies/999999/')
        self.assertEqual(response.status_code, 404)
