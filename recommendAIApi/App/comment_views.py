from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.throttling import ScopedRateThrottle

from .models import Comment, Interaction, Movie
from .pagination import CommentPagination
from .permissions import IsAuthorOrReadOnly
from .serializers import CommentSerializer


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    pagination_class = CommentPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    throttle_scope = 'comments'

    def get_movie(self):
        if not hasattr(self, '_movie'):
            self._movie = get_object_or_404(Movie, pk=self.kwargs['movie_id'])
        return self._movie

    def _movie_interaction_prefetch(self):
        return Prefetch(
            'user__interactions',
            queryset=Interaction.objects.filter(movie_id=self.get_movie().id),
            to_attr='movie_interaction',
        )

    def get_queryset(self):
        replies = (
            Comment.objects.select_related('user')
            .prefetch_related(self._movie_interaction_prefetch())
            .order_by('created_at')
        )
        return (
            Comment.objects.filter(
                movie=self.get_movie(),
                parent__isnull=True,
            )
            .select_related('user')
            .prefetch_related(self._movie_interaction_prefetch())
            .prefetch_related(Prefetch('replies', queryset=replies))
            .order_by('-created_at')
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['movie'] = self.get_movie()
        return context

    def get_throttles(self):
        if self.request.method == 'POST':
            return [ScopedRateThrottle()]
        return []

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, movie=self.get_movie())


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.select_related('user')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    http_method_names = ['get', 'patch', 'delete']

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.body = ''
        instance.save(update_fields=['is_deleted', 'body', 'updated_at'])
