from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from App.models import User, Movie, Interaction

@csrf_exempt
@require_http_methods(["POST"])
def rateMovies(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('id_user')
        movies_data = data.get('movies')
        

        user = User.objects.get(pk=user_id)

        for movie_data in movies_data:
            movie_id = movie_data.get('id_movie')
            like = movie_data.get('like', False)

            movie = Movie.objects.get(pk=movie_id)

            # Check if interaction already exists
            interaction, created = Interaction.objects.get_or_create(
                user=user,
                movie=movie,
                defaults={'liked': like, 'seen': True}  # Set defaults for new records
            )

            # If the interaction was not created, it means it already existed, and we should update it
            if not created:
                interaction.liked = like
                interaction.seen = True
                interaction.save()

        return JsonResponse({'id_user':user_id }, status=200)

    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Movie.DoesNotExist:
        return JsonResponse({'error': 'Movie not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
