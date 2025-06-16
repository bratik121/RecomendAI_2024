from django.apps import AppConfig
class AppAppConfig(AppConfig):  # 👈 Nombre único
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'App'