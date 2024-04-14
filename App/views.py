from sqlite3 import IntegrityError

from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm


# Create your views here.
def signup(request, *args, **kwargs):
    if request.method == 'GET':
        print('retrieving data.')
        return render(request, "signup.html", {
            'form': UserCreationForm
        })
    else:
        if request.POST['password1'] == request.POST['password2']:
            try:
                print('sending data...')
                user = User.objects.create_user(username=request.POST['username'], password=request.POST['password1'])
                user.save()
                return render(request, "signup.html", {'form': UserCreationForm, 'success': 'Succesful created!'})
            except IntegrityError:
                return render(request, "signup.html", {'form': UserCreationForm, 'error': 'Username already taken!'})

        return render(request, "signup.html",
                      {
                          'form': UserCreationForm,
                          'error': 'Passwords does not match'
                      })


def button_sign(request, *args, **kwargs):
    return render(request, "home.html", {})


def peliculas(request, *args, **kwargs):
    return render(request, "Peliculas.html", {})
