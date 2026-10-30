import json

from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import mixins, viewsets
from rest_framework.authtoken.models import Token

from .serializers import UserSerializer
from App.models import User


class UserViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Solo permite registrar usuarios.

    La lectura/edición/borrado de usuarios queda fuera de la API pública.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(pk=response.data['id'])
        token, _ = Token.objects.get_or_create(user=user)
        response.data['token'] = token.key
        return response


@csrf_exempt
def my_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        return render(request, 'base.html', {'data': data})
    else:
        if request.method == 'GET':
            return render(request, 'base.html')
