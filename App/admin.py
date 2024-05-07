from django.contrib import admin

# Register your models here.

from .models import User, gridView
from .models import Pelicula
from .models import userLike
from .models import knownMovie
from .models import unknownMovie
from .models import Movie
from .models import Interaction

admin.site.register(User)
admin.site.register(Pelicula)
admin.site.register(userLike)
admin.site.register(knownMovie)
admin.site.register(unknownMovie)
admin.site.register(gridView)
admin.site.register(Movie)
admin.site.register(Interaction)