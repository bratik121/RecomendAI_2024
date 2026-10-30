"""Backfill de logros: rellena name_en/description_en y corrige `{target}`.

Repara el bug por el cual las descripciones en español quedaron con la palabra
literal `{target}` (por un template sin interpolar) y rellena los campos en
inglés. Es idempotente: usa `update_or_create` a través del catálogo.
"""

from django.db import migrations

from App.achievement_catalog import build_catalog


def backfill(apps, schema_editor):
    Achievement = apps.get_model('App', 'Achievement')
    for row in build_catalog():
        Achievement.objects.update_or_create(key=row['key'], defaults=row)


class Migration(migrations.Migration):

    dependencies = [
        ('App', '0009_achievement_description_en_achievement_name_en'),
    ]

    operations = [
        migrations.RunPython(backfill, migrations.RunPython.noop),
    ]
