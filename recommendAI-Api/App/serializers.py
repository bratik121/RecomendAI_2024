from rest_framework import serializers
from .models import User , Movie, Interaction
from django.contrib.auth.hashers import make_password



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
