from django.contrib import admin

# Register your models here.

from .models import User
from .models import Movie
from .models import Interaction

admin.site.register(User)
admin.site.register(Movie)
admin.site.register(Interaction)