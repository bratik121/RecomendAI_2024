from django.db import models
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Interaction, Movie
from .permissions import IsAuthorOrReadOnly
from .serializers import RatingSerializer
from .recommendation.cache import invalidate_recommendations


class RatingCreateView(generics.CreateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        movie = serializer.validated_data['movie']
        score = serializer.validated_data['rating']

        interaction, _ = Interaction.objects.update_or_create(
            user=request.user,
            movie=movie,
            defaults={
                'rating': score,
                'rated_at': timezone.now(),
                'seen': True,
            },
        )
        invalidate_recommendations(request.user.id)

        output = RatingSerializer(interaction, context={'request': request})
        return Response(output.data, status=201)


class RatingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    http_method_names = ['get', 'patch']

    def get_queryset(self):
        return Interaction.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(rated_at=timezone.now())
        invalidate_recommendations(self.request.user.id)


class MovieRatingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        get_movie = Movie.objects.filter(pk=pk).first()
        if get_movie is None:
            return Response({'detail': 'No encontrado.'}, status=404)

        interactions = Interaction.objects.filter(
            movie_id=pk, rating__isnull=False
        )
        aggregate = interactions.aggregate(
            average=models.Avg('rating'),
            count=models.Count('id'),
        )
        distribution = {
            str(score): count
            for score, count in interactions.values_list('rating').annotate(
                count=models.Count('id')
            ).order_by('rating')
        }

        user_rating = None
        if request.user.is_authenticated:
            mine = Interaction.objects.filter(
                user=request.user, movie_id=pk, rating__isnull=False
            ).first()
            if mine:
                user_rating = {
                    'id': mine.id,
                    'score': mine.rating,
                    'rated_at': mine.rated_at,
                }

        return Response({
            'average': round(float(aggregate['average']), 1) if aggregate['average'] is not None else None,
            'count': aggregate['count'],
            'distribution': distribution,
            'user_rating': user_rating,
        })
