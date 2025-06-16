from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Movie, Interaction

@csrf_exempt
@require_http_methods(["GET"])
def search_movies_by_name(request):
    title = request.GET.get('title', '')
    user_id = request.GET.get('id_user', None)
    if not title:
        return JsonResponse({'error': 'No title provided'}, status=400)
    
    # Case-insensitive search for movies containing the title
    movies = Movie.objects.filter(title__icontains=title)
    movies_data = []
    for movie in movies:
        liked = False
        if user_id:
            interaction = Interaction.objects.filter(user_id=user_id, movie=movie).first()
            if interaction:
                liked = interaction.liked
        movies_data.append({
            'id': movie.id,
            'title': movie.title,
            'overview': movie.overview,
            'release_year': movie.release_year,
            'genres': movie.genres,
            'popularity': movie.popularity,
            'vote_average': movie.vote_average,
            'poster_path': movie.poster_path,
            'liked': liked
        })
    return JsonResponse(movies_data, safe=False)
