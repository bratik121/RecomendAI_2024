from django.db import models
from jsonfield import JSONField


class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=30)
    email = models.EmailField(max_length=254)
    password = models.CharField(max_length=30)
    lastname = models.CharField(max_length=30)


class Pelicula(models.Model):
    idPelicula = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=30)
    fecha = models.DateField()
    presupuesto = models.IntegerField()
    votecount = models.IntegerField()
    generos = JSONField()


class userLike(models.Model):
    idUser = models.AutoField(primary_key=True)
    peliculas = JSONField()


class knownMovie(models.Model):
    idUser = models.AutoField(primary_key=True)
    peliculas = JSONField()


class unknownMovie(models.Model):
    idUser = models.AutoField(primary_key=True)
    peliculas = JSONField()

class gridView(models.Model):
    idUser = models.AutoField(primary_key=True)
    genreGrid = JSONField()
    binaryY = models.BinaryField()
    binarySeen = models.BinaryField()
