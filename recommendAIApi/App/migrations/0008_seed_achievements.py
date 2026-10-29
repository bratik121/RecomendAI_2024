"""Semilla del catálogo de logros.

Los logros se definen en `App/achievement_catalog.py`. Esta migración crea las
filas iniciales de `Achievement`. El servicio `achievement_service.sync_catalog`
también hace `get_or_create` al consultar, de modo que cualquier logro nuevo que
se agregue al catálogo más adelante se cree sin necesidad de otra migración.
"""

from django.db import migrations

from App.achievement_catalog import build_catalog


def seed_achievements(apps, schema_editor):
    Achievement = apps.get_model('App', 'Achievement')
    for row in build_catalog():
        Achievement.objects.update_or_create(key=row['key'], defaults=row)


def unseed_achievements(apps, schema_editor):
    Achievement = apps.get_model('App', 'Achievement')
    keys = [row['key'] for row in build_catalog()]
    Achievement.objects.filter(key__in=keys).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('App', '0007_achievement_chatconversation_chatquota_chatmessage_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_achievements, unseed_achievements),
    ]
