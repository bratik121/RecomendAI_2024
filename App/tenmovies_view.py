from django.http import JsonResponse
from .models import Movie, Interaction
from django.db.models import Q

def tenmovies(request, idUser):
    if request.method == 'GET':
        # Get a list of movie IDs that the user has already interacted with
        user_interacted_movie_ids = Interaction.objects.filter(user__id=idUser).values_list('movie_id', flat=True)

        # Get 10 random movies that the user has not interacted with
        movies_to_recommend = Movie.objects.exclude(id__in=user_interacted_movie_ids).order_by('?')[:10]

        # Prepare the data to return
        movies_data = [{
            'id': movie.id,
            'title': movie.title,
            'overview': movie.overview,
            'release_year': movie.release_year,
            'genres': movie.genres,
            'vote_average': movie.vote_average,
            'poster_path': movie.poster_path
        } for movie in movies_to_recommend]

        return JsonResponse(movies_data, safe=False)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
