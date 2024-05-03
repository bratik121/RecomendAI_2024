from rest_framework import serializers
from .models import User, gridView
from .models import Pelicula
from .models import userLike
from .models import knownMovie
from .models import unknownMovie

class PeliculaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pelicula
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

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