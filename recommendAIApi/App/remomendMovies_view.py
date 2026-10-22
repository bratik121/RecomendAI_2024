import random

from django.db.models import Avg, Count
from django.http import JsonResponse

from .models import Movie
from .recommendation.cache import get_recommendations


def _serialize_movie(movie):
    return {
        'id': movie.id,
        'title': movie.title,
        'poster_path': movie.poster_path,
        'release_year': movie.release_year,
        'vote_average': movie.vote_average,
        'overview': movie.overview,
        'genres': movie.genres if isinstance(movie.genres, list) else (
            movie.genres.split(', ') if isinstance(movie.genres, str) else []
        ),
        'average_rating': round(float(movie.average_rating), 1) if movie.average_rating is not None else None,
        'ratings_count': movie.ratings_count or 0,
    }


def recommend_movies(request, idUser):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        movie_ids, cache_hit = get_recommendations(idUser)
        movies_by_id = {
            movie.id: movie
            for movie in Movie.objects.filter(id__in=movie_ids).annotate(
                average_rating=Avg('interactions__rating'),
                ratings_count=Count('interactions__rating'),
            )
        }
        movies = [movies_by_id[movie_id] for movie_id in movie_ids if movie_id in movies_by_id]

        # Mantenemos el comportamiento original: top-20 mezclado y 10 finales.
        random.shuffle(movies)
        response_data = [_serialize_movie(movie) for movie in movies[:10]]

        response = JsonResponse(response_data, safe=False)
        response['X-Recommend-Cache'] = 'HIT' if cache_hit else 'MISS'
        return response
    except Exception as exc:
        return JsonResponse({'error': str(exc)}, status=500)
