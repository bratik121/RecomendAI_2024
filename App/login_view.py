import logging
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        logger.debug(f"Attempting to login with email: {email}")
        print(email)
        print(password)

        user = authenticate(request, username=email, password=password)

        print(user)
        if user is not None:
            login(request, user)
            logger.debug("Login successful")
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            logger.warning("Login failed - Invalid credentials")
            return JsonResponse({'message': 'Invalid credentials'}, status=401)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)
