"""Endpoints de chat y logros."""

from __future__ import annotations

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from App.achievement_service import evaluate_achievements, get_summary
from App.chat_quota import check_and_consume, get_quota
from App.chat_service import ChatServiceError, generate
from App.models import ChatConversation, ChatMessage


class ChatView(APIView):
    """POST /api/chat/ — envía un mensaje y devuelve la respuesta del asistente.

    Requiere autenticación. El cupo se aplica por rango (ver `chat_quota`).
    """

    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'chat'

    def get(self, request):
        """GET /api/chat/?conversation_id=... — historial de una conversación."""
        conversation_id = request.query_params.get('conversation_id')
        if not conversation_id:
            return Response({'detail': 'Falta conversation_id.'}, status=400)

        conversation = ChatConversation.objects.filter(
            id=conversation_id, user=request.user
        ).first()
        if conversation is None:
            return Response({'detail': 'Conversación no encontrada.'}, status=404)

        messages = conversation.messages.all().order_by('created_at')
        return Response({
            'conversation_id': conversation.id,
            'messages': [
                {
                    'id': m.id,
                    'role': m.role,
                    'content': m.content,
                    'created_at': m.created_at,
                }
                for m in messages
            ],
        })

    def post(self, request):
        message = (request.data.get('message') or '').strip()
        max_len = settings.CHAT_MAX_MESSAGE_LENGTH
        if not message:
            return Response({'detail': 'El mensaje no puede estar vacío.'}, status=400)
        if len(message) > max_len:
            return Response(
                {'detail': f'El mensaje no puede superar {max_len} caracteres.'},
                status=400,
            )

        conversation_id = request.data.get('conversation_id')
        if conversation_id:
            conversation = ChatConversation.objects.filter(
                id=conversation_id, user=request.user
            ).first()
            if conversation is None:
                return Response({'detail': 'Conversación no encontrada.'}, status=404)
        else:
            conversation = ChatConversation.objects.create(user=request.user)

        # Comprobamos el cupo ANTES de llamar al modelo.
        quota_info = get_quota(request.user)
        if quota_info['remaining'] <= 0:
            return Response(
                {
                    'detail': 'Alcanzaste el límite de consultas de tu rango.',
                    'quota': quota_info,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        history = list(
            conversation.messages.order_by('-created_at')[: settings.CHAT_CONTEXT_MESSAGES]
        )
        history.reverse()
        history = [{'role': m.role, 'content': m.content} for m in history]

        try:
            result = generate(message, history)
        except ChatServiceError as exc:
            return Response({'detail': str(exc)}, status=503)

        # Persistimos el turno (usuario + asistente).
        ChatMessage.objects.create(conversation=conversation, role='user', content=message)
        assistant = ChatMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=result['reply'],
            movie_ids=result['movie_ids'],
        )

        # Consumimos el cupo tras una respuesta exitosa.
        allowed, quota_after = check_and_consume(request.user)

        # Reconstruimos las películas recomendadas desde las candidatas reales.
        candidates_by_id = {m.id: m for m in result['candidates']}
        recommended = []
        for movie_id in result['movie_ids']:
            movie = candidates_by_id.get(movie_id)
            if movie is None:
                continue
            recommended.append({
                'id': movie.id,
                'title': movie.title,
                'release_year': movie.release_year,
                'genres': movie.genres if isinstance(movie.genres, list) else [],
            })

        # El uso del chat puede desbloquear logros.
        evaluate_achievements(request.user.id)

        return Response({
            'conversation_id': conversation.id,
            'message': {
                'id': assistant.id,
                'role': 'assistant',
                'content': assistant.content,
            },
            'recommended_movies': recommended,
            'quota': {
                'remaining': quota_after['remaining'],
                'limit': quota_after['limit'],
                'type': quota_after['type'],
                'rank': quota_after['rank'],
            },
        })


class AchievementsView(APIView):
    """GET /api/achievements/ — resumen de logros y rango del usuario."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        lang = self._resolve_lang(request)
        summary = get_summary(request.user.id, lang=lang)
        return Response(summary)

    @staticmethod
    def _resolve_lang(request) -> str:
        header = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
        if header:
            return header.split(',')[0].split('-')[0].strip().lower()
        return 'es'
