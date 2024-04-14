from django.db import models


# Create your models here.
class Alumno(models.Model):
    nombre = models.CharField(max_length=20)
    apellidos = models.CharField(max_length=20)
    edad = models.IntegerField()
    direccion = models.CharField(max_length=50)