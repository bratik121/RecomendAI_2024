"""Asigna el rol de un usuario de forma segura.

Uso:
    python manage.py setrole email@example.com root
    python manage.py setrole email@example.com admin
    python manage.py setrole email@example.com user
"""

from django.core.management.base import BaseCommand, CommandError

from App.models import Role, User


class Command(BaseCommand):
    help = 'Cambia el rol de un usuario (root/admin/user).'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str)
        parser.add_argument('role', type=str, choices=[Role.ROOT, Role.ADMIN, Role.USER])

    def handle(self, *args, **options):
        email = options['email']
        new_role = options['role']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise CommandError(f'No existe un usuario con email {email!r}.')

        if user.role == Role.ROOT and new_role != Role.ROOT:
            remaining = User.objects.filter(role=Role.ROOT, is_active=True).exclude(pk=user.pk)
            if not remaining.exists():
                raise CommandError('No se puede demover al último root activo.')

        user.role = new_role
        user.is_staff = new_role in (Role.ADMIN, Role.ROOT)
        if new_role == Role.ROOT:
            user.is_superuser = True
        user.save(update_fields=['role', 'is_staff', 'is_superuser'])

        self.stdout.write(self.style.SUCCESS(f'{email} ahora tiene rol {new_role!r}.'))
