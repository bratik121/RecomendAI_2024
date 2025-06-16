from django.db import models
from jsonfield import JSONField


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
    genres = JSONField()  # Esto almacenará una lista de géneros como JSON

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
