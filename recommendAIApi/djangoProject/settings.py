"""
Django settings for djangoProject project.

Configuración cargada desde variables de entorno mediante django-environ.
Copiá `.env.example` a `.env` y completá los valores reales.
"""

import os
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)

# Lee el archivo `.env` si existe (no se versiona).
environ.Env.read_env(BASE_DIR / '.env')

# ---------------------------------------------------------------------------
# Django core
# ---------------------------------------------------------------------------
SECRET_KEY = env('SECRET_KEY')
DEBUG = env.bool('DEBUG', default=False)

# Fallback de desarrollo. En producción debe configurarse explícitamente.
ALLOWED_HOSTS = env.list(
    'ALLOWED_HOSTS',
    default=['localhost', '127.0.0.1', 'testserver', '192.168.0.103'],
)

# ---------------------------------------------------------------------------
# Application definition
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cloudinary_storage',      # <- debe ir antes de staticfiles si está
    'cloudinary',              # <- opcional, pero recomendado
    'App.apps.AppAppConfig',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'comments': '10/min',
    },
}

RECOMMENDER_VERSION = 'rf-v1'
RECOMMENDATION_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # This should be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',  # After CorsMiddleware
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'djangoProject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'djangoProject.wsgi.application'

# ---------------------------------------------------------------------------
# CORS / CSRF
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env.list(
    'CORS_ALLOWED_ORIGINS',
    default=['http://localhost:5173', 'http://127.0.0.1:5173'],
)
CORS_ALLOW_ALL_ORIGINS = env.bool('CORS_ALLOW_ALL_ORIGINS', default=DEBUG)

CSRF_TRUSTED_ORIGINS = env.list(
    'CSRF_TRUSTED_ORIGINS',
    default=['http://localhost:5173', 'http://127.0.0.1:5173'],
)

FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:5173')

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DATABASES = {
    'default': env.db(
        'DATABASE_URL',
        default='postgres://postgres:postgres@localhost:5432/postgres',
    )
}

# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------
STATIC_URL = 'static/'

# ---------------------------------------------------------------------------
# Media / storage (Cloudinary cuando hay credenciales; local en caso contrario)
# ---------------------------------------------------------------------------
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

CLOUDINARY_CLOUD_NAME = env('CLOUDINARY_CLOUD_NAME', default='')
CLOUDINARY_API_KEY = env('CLOUDINARY_API_KEY', default='')
CLOUDINARY_API_SECRET = env('CLOUDINARY_API_SECRET', default='')


def _cloudinary_configured() -> bool:
    return bool(
        CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
    )


# `django-cloudinary-storage` es opcional: si no está instalado o no hay
# credenciales, se usa el almacenamiento local (útil para tests/CI).
try:
    import cloudinary_storage  # noqa: F401
    import cloudinary  # noqa: F401
    import cloudinary.uploader  # noqa: F401
    import cloudinary.api  # noqa: F401

    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False


# 👇 AQUÍ ESTÁ EL FIX: configurar el SDK global de Cloudinary
if CLOUDINARY_AVAILABLE and _cloudinary_configured():
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )


CLOUDINARY_STORAGE = {
    'CLOUD_NAME': CLOUDINARY_CLOUD_NAME,
    'API_KEY': CLOUDINARY_API_KEY,
    'API_SECRET': CLOUDINARY_API_SECRET,
}

if CLOUDINARY_AVAILABLE and _cloudinary_configured():
    STORAGES = {
        'default': {
            'BACKEND': 'cloudinary_storage.storage.MediaCloudinaryStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }
else:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }

AUTH_USER_MODEL = 'App.User'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# Email (opcional)
# ---------------------------------------------------------------------------
EMAIL_BACKEND = env(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.smtp.EmailBackend',
)
EMAIL_HOST = env('EMAIL_HOST', default='')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='RecomendAI <no-reply@example.com>')