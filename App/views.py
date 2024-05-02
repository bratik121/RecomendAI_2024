from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.db import IntegrityError

@require_http_methods(["GET", "POST"])
def signup(request, *args, **kwargs):
    if request.method == 'GET':
        print('retrieving data.')
        return JsonResponse({
            "code": 200,
            "data": [],
            "message": "User creation form retrieved successfully."
        })
    else:
        if request.POST['password1'] == request.POST['password2']:
            try:
                print('sending data...')
                user = User.objects.create_user(username=request.POST['username'], password=request.POST['password1'])
                user.save()
                return JsonResponse({
                    "code": 201,
                    "data": {
                        "user": {
                            "username": user.username,
                            "name": 'bryant',
                            "lastname": "mitchell"
                        }
                    },
                    "message": "User created successfully!"
                })
            except IntegrityError:
                return JsonResponse({
                    "code": 400,
                    "data": [],
                    "message": "Username already taken!"
                })
        else:
            return JsonResponse({
                "code": 400,
                "data": [],
                "message": "Passwords do not match!"
            })