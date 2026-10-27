from django.contrib import admin

from .models import CatalogState, Comment, Interaction, Movie, RecommendationCache, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'name', 'lastname', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'name', 'lastname')


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'release_year', 'vote_average', 'popularity', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title',)


@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie', 'liked', 'seen')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'movie', 'user', 'parent', 'created_at', 'is_deleted')
    list_filter = ('is_deleted', 'created_at')
    search_fields = ('body', 'movie__title', 'user__email')


@admin.register(RecommendationCache)
class RecommendationCacheAdmin(admin.ModelAdmin):
    list_display = ('user', 'catalog_version', 'recommender_version', 'generated_at', 'compute_ms')


@admin.register(CatalogState)
class CatalogStateAdmin(admin.ModelAdmin):
    list_display = ('version', 'updated_at')
