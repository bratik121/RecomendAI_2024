"""Tests de recuperación del RAG (sin llamar a Gemini)."""

from django.test import TestCase

from App.models import Movie
from App.movie_retrieval import (
    _detect_decade,
    _detect_genres,
    _extract_title_candidates,
    retrieve_candidates,
)


class MovieRetrievalTests(TestCase):
    def setUp(self):
        self.cars = Movie.objects.create(
            title='Cars', poster_path='/cars.jpg', release_year='2006',
            overview='Un auto de carreras aprende sobre la amistad.',
            popularity=10.0, vote_average=0.8, revenue=0.5,
            genres=['Animation', 'Family', 'Comedy'],
        )
        self.toy_story = Movie.objects.create(
            title='Toy Story', poster_path='/ts.jpg', release_year='1995',
            overview='Juguetes que cobran vida.',
            popularity=9.0, vote_average=0.85, revenue=0.6,
            genres=['Animation', 'Family', 'Adventure'],
        )
        self.horror = Movie.objects.create(
            title='The Conjuring', poster_path='/tc.jpg', release_year='2013',
            overview='Una familia es atormentada por un espíritu.',
            popularity=8.0, vote_average=0.7, revenue=0.4,
            genres=['Horror', 'Thriller'],
        )
        self.nineties = Movie.objects.create(
            title='Pulp Fiction', poster_path='/pf.jpg', release_year='1994',
            overview='Historias entrelazadas de crimen.',
            popularity=9.5, vote_average=0.9, revenue=0.7,
            genres=['Crime', 'Drama'],
        )

    def test_detect_genres_terror(self):
        self.assertIn('Horror', _detect_genres('algo de terror'))

    def test_detect_genres_animation_family(self):
        genres = _detect_genres('animadas para ver con mi familia')
        self.assertIn('Animation', genres)
        self.assertIn('Family', genres)

    def test_detect_genres_comedy_romance(self):
        genres = _detect_genres('recomendame una comedia romántica')
        self.assertIn('Comedy', genres)
        self.assertIn('Romance', genres)

    def test_no_false_positive_interaccion(self):
        # "interacción" no debe detectar "acción".
        self.assertNotIn('Action', _detect_genres('películas con mucha interacción'))

    def test_detect_decade_nineties(self):
        self.assertEqual(_detect_decade('películas de los 90'), ('1990', '1999'))

    def test_detect_decade_full_year(self):
        self.assertEqual(_detect_decade('películas de 1994'), ('1990', '1999'))

    def test_extract_title_candidates(self):
        cands = _extract_title_candidates('películas parecidas a Cars')
        self.assertIn('cars', cands)

    def test_retrieve_by_title(self):
        result = retrieve_candidates('películas parecidas a Cars')
        self.assertTrue(result['matched'])
        self.assertEqual(result['seed'].title, 'Cars')
        self.assertIn(self.toy_story, result['candidates'])

    def test_retrieve_by_genre(self):
        result = retrieve_candidates('algo de terror')
        self.assertTrue(result['matched'])
        self.assertIn(self.horror, result['candidates'])

    def test_retrieve_by_decade(self):
        result = retrieve_candidates('películas de los 90')
        self.assertTrue(result['matched'])
        self.assertIn(self.nineties, result['candidates'])

    def test_no_match_returns_matched_false(self):
        result = retrieve_candidates('películas sobre wombats voladores')
        self.assertFalse(result['matched'])
