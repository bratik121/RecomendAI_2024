import logging
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

from App.models import User

logger = logging.getLogger(__name__)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        logger.debug(f"Attempting to login with email: {email}")
  

        user = authenticate(request, username=email, password=password)
        print(user)
        if user is not None and isinstance(user, User):
            login(request, user)
            logger.debug("Login successful")
            return JsonResponse({
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'lastname': user.lastname,
            }, status=200)
        else:
            logger.warning("Login failed - Invalid credentials")
            return JsonResponse({'message': 'Invalid credentials'}, status=401)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)
