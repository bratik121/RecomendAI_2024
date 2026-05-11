from django.http import JsonResponse
from .models import Movie, Interaction
import random


def tenmovies(request, idUser):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # Get movie IDs already classified/interacted by the user
    user_interacted_movie_ids = Interaction.objects.filter(
        user_id=idUser
    ).values_list('movie_id', flat=True)

    # First, get a pool of popular movies that the user has not interacted with.
    # We take more than 10 so the final result can still be random.
    popular_movies_pool = list(
        Movie.objects
        .exclude(id__in=user_interacted_movie_ids)
        .filter(
            popularity__gt=0,
            vote_average__gt=0
        )
        .order_by('-popularity', '-vote_average')[:200]
    )

    # Select 10 random movies from the popular pool
    movies_to_recommend = random.sample(
        popular_movies_pool,
        min(10, len(popular_movies_pool))
    )

    movies_data = [{
        'id': movie.id,
        'title': movie.title,
        'overview': movie.overview,
        'release_year': movie.release_year,
        'genres': movie.genres,
        'popularity': movie.popularity,
        'vote_average': movie.vote_average,
        'poster_path': movie.poster_path
    } for movie in movies_to_recommend]

    return JsonResponse(movies_data, safe=False)