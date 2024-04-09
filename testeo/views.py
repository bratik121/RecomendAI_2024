from django.contrib.auth.models import User
from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponse

# Create your views here.
def signup(request, *args, **kwargs):
    if request.method == 'GET':
        print('retrieving data.')
    else:
        if request.POST['password1'] == request.POST['password2']:
            try:
                print('sending data...')
                user = User.objects.create_user(username=request.POST['username'], password=request.POST['password1'])
                user.save()
                return render(request, "signup.html", {'form': UserCreationForm, 'success': 'Succesful created!'})
            except:
                return render(request, "signup.html", {'form': UserCreationForm, 'error': 'Passwords does not match'})

    return render(request, "signup.html", {
        'form': UserCreationForm
    })


def button_sign(request, *args, **kwargs):
    return render(request, "home.html", {})
