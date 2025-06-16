from django.http import JsonResponse
from .models import Interaction

def interactions(request, idUser):
    try:
        user_interactions = Interaction.objects.filter(user__id=idUser)
        data = [{
            'movie_id': interaction.movie.id,
            'movie_title': interaction.movie.title,
            'movie_genres': interaction.movie.genres,
            'liked': interaction.liked,
            'seen': interaction.seen,
        } for interaction in user_interactions]
        return JsonResponse(data, safe=False)
    except Interaction.DoesNotExist:
        return JsonResponse({'error': 'No interactions found for the given user'}, status=404)
