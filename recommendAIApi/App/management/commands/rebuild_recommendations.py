from django.core.management.base import BaseCommand

from App.models import RecommendationCache, User
from App.recommendation.cache import get_recommendations


class Command(BaseCommand):
    help = 'Invalida y precalcula las recomendaciones de los usuarios.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            type=int,
            help='ID de un usuario específico. Si se omite, procesa todos.',
        )
        parser.add_argument(
            '--no-warm',
            action='store_true',
            help='Solo invalida el cache, sin recalcular.',
        )

    def handle(self, *args, **options):
        user_id = options.get('user')
        users = User.objects.all().order_by('id')
        if user_id:
            users = users.filter(pk=user_id)

        if options['no_warm']:
            deleted, _ = RecommendationCache.objects.filter(
                user_id__in=users.values_list('id', flat=True)
            ).delete()
            self.stdout.write(self.style.SUCCESS(f'Caches eliminados: {deleted}'))
            return

        total = 0
        for user in users.iterator():
            get_recommendations(user.id)
            total += 1
            self.stdout.write(f'Usuario {user.id}: recomendaciones listas')

        self.stdout.write(self.style.SUCCESS(f'Usuarios procesados: {total}'))
