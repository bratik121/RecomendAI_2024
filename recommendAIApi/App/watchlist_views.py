from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WatchlistItem
from .serializers import WatchlistSerializer


class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        queryset = WatchlistItem.objects.select_related('movie').filter(user=self.request.user)
        watched = self.request.query_params.get('watched')
        if watched in ('true', 'false'):
            queryset = queryset.filter(watched=watched == 'true')
        return queryset

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                serializer.save(user=self.request.user)
        except IntegrityError:
            raise ValidationError({'detail': 'Esa película ya está en tu watchlist.'}) from None

    def perform_update(self, serializer):
        watched = serializer.validated_data.get('watched')
        watched_at = timezone.now() if watched else None
        serializer.save(watched_at=watched_at)


class WatchlistSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = WatchlistItem.objects.filter(user=request.user)
        pending = items.filter(watched=False).count()
        watched = items.filter(watched=True).count()
        return Response({
            'pending': pending,
            'watched': watched,
            'total': pending + watched,
        })
