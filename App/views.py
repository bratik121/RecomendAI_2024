import json
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from .serializers import PeliculaSerializer, userLikeSerializer, UserSerializer, gridViewSerializer, \
    knownMovieSerializer, unknownMovieSerializer
from App.models import Pelicula, User, gridView, knownMovie, userLike


class PeliculaViewSet(viewsets.ModelViewSet):
    queryset = Pelicula.objects.all()
    serializer_class = PeliculaSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class gridViewSet(viewsets.ModelViewSet):
    queryset = gridView.objects.all()
    serializer_class = gridViewSerializer


class knownMovieViewSet(viewsets.ModelViewSet):
    queryset = knownMovie.objects.all()
    serializer_class = knownMovieSerializer


class unknownMovieViewSet(viewsets.ModelViewSet):
    queryset = knownMovie.objects.all()
    serializer_class = unknownMovieSerializer


class UserLikeViewSet(viewsets.ModelViewSet):
    queryset = userLike.objects.all()
    serializer_class = userLikeSerializer


@csrf_exempt
def my_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)  # parse the JSON data into a dictionary
        # do something with the data
        return render(request, 'base.html', {'data': data})
    else:
        if request.method == 'GET':
            return render(request, 'base.html')  # return the data as a JSON response
