"""Semilla del catálogo de logros.

Los logros se definen en `App/achievement_catalog.py`. Esta migración crea las
filas iniciales de `Achievement`. El servicio `achievement_service.sync_catalog`
también actualiza los logros al consultar, de modo que cualquier logro nuevo (o
cambio de campos) que se agregue al catálogo se aplique sin otra migración.

Importante: como esta migración corre ANTES de que existan `name_en`/
`description_en` (se agregan en 0009), filtramos los campos del catálogo a los
que el modelo tiene en este punto, para que siga siendo reproducible en una base
de datos recién creada.
"""

from django.db import migrations

from App.achievement_catalog import build_catalog

# Campos que existen en `Achievement` en el momento de esta migración.
_HISTORICAL_FIELDS = {
    'key', 'category', 'name', 'description', 'icon', 'target', 'order',
}


def seed_achievements(apps, schema_editor):
    Achievement = apps.get_model('App', 'Achievement')
    for row in build_catalog():
        defaults = {k: v for k, v in row.items() if k in _HISTORICAL_FIELDS}
        defaults.setdefault('is_active', True)
        Achievement.objects.update_or_create(key=row['key'], defaults=defaults)


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
