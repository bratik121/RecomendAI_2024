from rest_framework import serializers
from .models import User, gridView
from .models import Pelicula
from .models import userLike
from .models import knownMovie
from .models import unknownMovie
from django.contrib.auth.hashers import make_password

class PeliculaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pelicula
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'lastname', 'is_active', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True}  # Esto hace que la contraseña no sea retornada en las respuestas de la API
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)

class gridViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = gridView
        fields = '__all__'

class knownMovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = knownMovie
        fields = '__all__'

class unknownMovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = unknownMovie
        fields = '__all__'

class userLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = userLike
        fields = '__all__'