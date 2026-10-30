from django.apps import AppConfig
class AppAppConfig(AppConfig):  # 👈 Nombre único
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'App'

    def ready(self):
        from App.recommendation import signals  # noqa: F401
        from App import metrics_signals  # noqa: F401