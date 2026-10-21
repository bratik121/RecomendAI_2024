from django.db import models
from django.db.models import F


from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

class MyUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=254, unique=True)
    name = models.CharField(max_length=30)
    lastname = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


class Movie(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    poster_path = models.CharField(max_length=500)  # Asegúrate de que el path tenga suficiente longitud
    release_year = models.CharField(max_length=4)
    overview = models.TextField()
    popularity = models.FloatField()
    vote_average = models.FloatField()
    revenue = models.FloatField()
    genres = models.JSONField()  # Esto almacenará una lista de géneros como JSON

    def __str__(self):
        return self.title
    
class Interaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='interactions')
    liked = models.BooleanField(default=False)
    seen = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'movie')  # Asegura que la combinación de usuario y película sea única

    def __str__(self):
        return f"{self.user.name} - {self.movie.title}"


class CatalogState(models.Model):
    """Versión global del catálogo de películas.

    Se incrementa cuando cambia el catálogo para invalidar la matriz de
    features y las recomendaciones materializadas.
    """

    version = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'estado del catálogo'
        verbose_name_plural = 'estado del catálogo'

    @classmethod
    def get_version(cls):
        state, _ = cls.objects.get_or_create(pk=1)
        return state.version

    @classmethod
    def bump(cls):
        cls.objects.get_or_create(pk=1)
        cls.objects.filter(pk=1).update(version=F('version') + 1)
        return cls.objects.filter(pk=1).values_list('version', flat=True).first()

    def __str__(self):
        return f'Catálogo v{self.version}'


class RecommendationCache(models.Model):
    """Recomendaciones materializadas por usuario.

    Guardamos el top-20 de IDs para poder mezclar y devolver 10 en cada
    request sin volver a entrenar el modelo.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='recommendation_cache',
    )
    movie_ids = models.JSONField(default=list)
    interaction_hash = models.CharField(max_length=64)
    catalog_version = models.PositiveIntegerField(default=0)
    recommender_version = models.CharField(max_length=32, default='rf-v1')
    generated_at = models.DateTimeField(auto_now=True)
    compute_ms = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'cache de recomendaciones'
        verbose_name_plural = 'caches de recomendaciones'

    def __str__(self):
        return f'Recomendaciones de {self.user_id}'


class Comment(models.Model):
    """Comentario de una película, con un nivel de respuestas."""

    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['movie', 'parent', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f'{self.user.name} en {self.movie.title}'
