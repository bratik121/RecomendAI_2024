"""Servicio de chat: integración con Gemini + RAG textual.

Responsabilidades:
- Construir el contexto con películas REALES recuperadas de la base.
- Llamar a Gemini y obtener una respuesta que solo puede elegir entre esas
  películas (los IDs se validan contra el contexto antes de devolverse).
- Manejar errores de cuota/indisponibilidad de forma amigable.

No hay secretos en el código: la API key se lee de `settings.GEMINI_API_KEY`,
que a su vez viene de la variable de entorno `GEMINI_API_KEY` (.env).
"""

from __future__ import annotations

import json
import logging

from django.conf import settings

from App.movie_retrieval import retrieve_candidates

logger = logging.getLogger(__name__)


class ChatServiceError(Exception):
    """Error controlado del asistente (se traduce a un mensaje amigable)."""


SYSTEM_PROMPT = (
    "Sos el asistente de recomendación de una app de cine llamada What2Watch. "
    "Respondé siempre en el idioma del usuario y en tono cercano. "
    "Solo podés recomendar películas que figuren en la lista CONTEXTO; está "
    "prohibido inventar títulos o datos. Para cada recomendación, elegí el "
    "campo `id` de una película real del contexto y explicá brevemente por qué "
    "podría gustarle. Si el CONTEXTO está vacío o no coincide con lo que pidió "
    "el usuario, decí explícitamente que no encontraste nada que coincida y "
    "pedile más detalles, SIN recomendar películas sueltas. Si el usuario pide "
    "algo fuera de recomendaciones, ayudalo con naturalidad sin recomendar "
    "películas inventadas."
)


def _build_context(message: str) -> dict:
    result = retrieve_candidates(message)
    movies = result['candidates']
    seed = result['seed']
    matched = result['matched']

    lines = []
    if seed is not None:
        lines.append(
            f"La película de referencia es {seed.title} "
            f"({seed.release_year}, géneros: {', '.join(seed.genres or [])})."
        )
    for m in movies:
        genres = ', '.join(m.genres) if isinstance(m.genres, list) else ''
        lines.append(
            f"- id={m.id} | {m.title} ({m.release_year}) | géneros: {genres} | {m.overview}"
        )
    return {
        'seed': seed,
        'candidates': movies,
        'matched': matched,
        'context_text': '\n'.join(lines),
    }


def _build_user_prompt(message: str, context_text: str, matched: bool, history) -> str:
    history_lines = []
    for msg in history:
        role = 'Usuario' if msg['role'] == 'user' else 'Asistente'
        history_lines.append(f'{role}: {msg["content"]}')

    context_block = f"CONTEXTO (solo estas películas son válidas):\n{context_text}"
    if not matched:
        context_block = (
            "CONTEXTO: NO se encontró ninguna película que coincida con la consulta. "
            "Respondé indicando que no encontraste y pedí más detalles."
        )

    return (
        f"{context_block}\n\n"
        f"Historial reciente:\n" + ('\n'.join(history_lines) or '(sin historial)') +
        f"\n\nMensaje del usuario: {message}\n\n"
        "Respondé en formato JSON con dos claves: `reply` (tu respuesta en texto) "
        "y `movie_ids` (array de números con los `id` de las películas que "
        "recomendás, tomados únicamente del contexto)."
    )


def _parse_response(text: str, candidates) -> tuple[str, list[int]]:
    """Parsea la respuesta JSON del modelo y valida los IDs contra el contexto."""
    text = (text or '').strip()
    # Quitar fences de markdown si los hubiera.
    if text.startswith('```'):
        text = text.strip('`')
        if text.startswith('json'):
            text = text[4:]

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return text, []

    reply = data.get('reply') or ''
    valid_ids = {m.id for m in candidates}
    movie_ids = [int(i) for i in (data.get('movie_ids') or []) if i in valid_ids]
    return reply, movie_ids


def _client():
    try:
        from google import genai
    except ImportError as exc:
        raise ChatServiceError(
            'El SDK de Gemini no está instalado en el servidor.'
        ) from exc

    if not settings.GEMINI_API_KEY:
        raise ChatServiceError('El asistente no está configurado. Falta la API key de Gemini.')

    return genai.Client(api_key=settings.GEMINI_API_KEY)


def generate(message: str, history: list[dict]) -> dict:
    """Genera la respuesta del asistente.

    `history` es una lista de dicts {role, content} de mensajes previos.
    Devuelve {reply, movie_ids} con los IDs validados contra el contexto.
    """
    client = _client()
    context = _build_context(message)

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[
                {'role': 'user', 'parts': [{'text': SYSTEM_PROMPT}]},
                {'role': 'user', 'parts': [{'text': _build_user_prompt(message, context['context_text'], context['matched'], history)}]},
            ],
        )
        text = response.text or ''
    except Exception as exc:
        logger.warning('Error al llamar a Gemini: %s', exc)
        raise ChatServiceError(
            'El asistente no está disponible en este momento. Intentá de nuevo más tarde.'
        ) from exc

    reply, movie_ids = _parse_response(text, context['candidates'])

    if not reply and not movie_ids:
        reply = 'No pude preparar una respuesta. Probá con otra consulta.'

    return {
        'reply': reply,
        'movie_ids': movie_ids,
        'candidates': context['candidates'],
    }
