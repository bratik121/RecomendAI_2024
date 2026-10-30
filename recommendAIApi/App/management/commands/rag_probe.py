"""Sonda de recuperación del RAG.

Ejecutá:  python manage.py rag_probe

Imprime, para cada consulta de ejemplo, qué detectó la recuperación (géneros,
década, seed por título, matched) y cuántas candidatas devolvió. Sirve para
documentar el comportamiento antes/después de cambios sin llamar a Gemini.
"""

from django.core.management.base import BaseCommand

from App.movie_retrieval import _detect_decade, _detect_genres, retrieve_candidates

QUERIES = [
    "películas parecidas a Cars",
    "algo de terror",
    "animadas para ver con mi familia",
    "recomendame una comedia romántica",
    "películas de los 90",
    "películas parecidas a Toy Story",
    "ciencia ficción espacial",
    "películas de acción de los 80",
    "un documental sobre la naturaleza",
    "dramas premiados",
]


class Command(BaseCommand):
    help = 'Sonda la recuperación del chat con consultas de ejemplo.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Sonda de recuperación RAG'))
        for query in QUERIES:
            genres = _detect_genres(query)
            decade = _detect_decade(query)
            result = retrieve_candidates(query)
            seed = result.get('seed')
            candidates = result.get('candidates', [])
            matched = result.get('matched')

            self.stdout.write('\n' + '-' * 70)
            self.stdout.write(f'Consulta: {query}')
            self.stdout.write(f'  géneros: {genres or "—"}')
            self.stdout.write(f'  década: {decade or "—"}')
            self.stdout.write(f'  seed: {seed.title if seed else "—"}')
            self.stdout.write(f'  matched: {matched} · candidatas: {len(candidates)}')
            for c in candidates[:5]:
                self.stdout.write(f'    - {c.title} ({c.release_year}) {c.genres}')
