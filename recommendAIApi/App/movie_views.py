from django.db.models import Avg, Count
from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Interaction, Movie
from .serializers import MovieSerializer


class MovieDetailView(generics.RetrieveAPIView):
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Movie.objects.annotate(
            average_rating=Avg('interactions__rating'),
            ratings_count=Count('interactions__rating'),
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        data['user_rating'] = None
        data['liked'] = False
        if request.user.is_authenticated:
            interaction = Interaction.objects.filter(
                user=request.user, movie=instance
            ).first()
            if interaction:
                data['liked'] = bool(interaction.liked)
                if interaction.rating is not None:
                    data['user_rating'] = {
                        'id': interaction.id,
                        'score': interaction.rating,
                        'rated_at': interaction.rated_at,
                    }
        return Response(data)
