from django.db import models
from django.db.models import F
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone
import uuid


from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class Role(models.TextChoices):
    """Roles de la aplicación.

    `root`  -> administrador con control total (incluye gestionar admins).
    `admin` -> administrador que gestiona usuarios comunes y contenido.
    `user`  -> usuario final de la aplicación.
    """

    ROOT = 'root', 'Root'
    ADMIN = 'admin', 'Admin'
    USER = 'user', 'User'


class MyUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('role', Role.USER)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('role', Role.ROOT)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=254, unique=True)
    name = models.CharField(max_length=30)
    lastname = models.CharField(max_length=30)
    bio = models.TextField(max_length=280, blank=True)
    avatar = models.ImageField(upload_to='avatars/%Y/%m/', blank=True, null=True)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    @property
    def is_admin(self):
        return self.role in (Role.ADMIN, Role.ROOT)

    @property
    def is_root(self):
        return self.role == Role.ROOT

    def __str__(self):
        return self.email


class Movie(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    poster_path = models.CharField(max_length=500)  # Asegúrate de que el path tenga suficiente longitud
    poster_image = models.ImageField(upload_to='movie-posters/', blank=True, null=True)
    release_year = models.CharField(max_length=4)
    overview = models.TextField()
    popularity = models.FloatField()
    vote_average = models.FloatField()
    revenue = models.FloatField()
    genres = models.JSONField()  # Esto almacenará una lista de géneros como JSON
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
    
class Interaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='interactions')
    liked = models.BooleanField(default=False)
    seen = models.BooleanField(default=False)
    rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    rated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'movie')  # Asegura que la combinación de usuario y película sea única
        indexes = [
            models.Index(fields=['movie', 'rating']),
        ]

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


class WatchlistItem(models.Model):
    """Película guardada por un usuario para ver más tarde."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='watchlist_items')
    watched = models.BooleanField(default=False)
    watched_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'watched']),
        ]

    def __str__(self):
        return f'{self.user.name} → {self.movie.title}'


class ChatConversation(models.Model):
    """Conversación de chat de un usuario autenticado.

    Guardamos los mensajes para que el usuario retome la conversación al volver.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'Chat de {self.user.email}'


class ChatMessage(models.Model):
    """Mensaje individual dentro de una conversación."""

    class Role(models.TextChoices):
        USER = 'user', 'User'
        ASSISTANT = 'assistant', 'Assistant'

    conversation = models.ForeignKey(
        ChatConversation, on_delete=models.CASCADE, related_name='messages'
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    content = models.TextField()
    # IDs de películas reales referenciadas en la respuesta (para el frontend).
    movie_ids = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]

    def __str__(self):
        return f'{self.role}: {self.content[:40]}'


class ChatQuota(models.Model):
    """Contador de uso del chat por usuario, para limitar por rango.

    `rank_count` cuenta los mensajes desde que el usuario está en su rango
    actual (se reinicia al cambiar de rango). `daily_count`/`daily_date` solo
    se usa para el rango Maestro, que tiene un límite diario.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='chat_quota')
    rank = models.CharField(max_length=10, blank=True, default='')
    rank_count = models.PositiveIntegerField(default=0)
    daily_date = models.DateField(null=True, blank=True)
    daily_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'Quota de {self.user.email}'


class Achievement(models.Model):
    """Logro desbloqueable, con su categoría, hito e ícono."""

    key = models.CharField(max_length=64, unique=True)
    category = models.CharField(max_length=32)
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=255)
    icon = models.CharField(max_length=64, blank=True, default='Award')
    target = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'order', 'target']

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """Logro desbloqueado por un usuario."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(
        Achievement, on_delete=models.CASCADE, related_name='unlocks'
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-unlocked_at']

    def __str__(self):
        return f'{self.user.email} · {self.achievement.name}'
