from django.contrib import admin

from .models import (
    Achievement,
    CatalogState,
    ChatConversation,
    ChatMessage,
    ChatQuota,
    Comment,
    Interaction,
    Movie,
    RecommendationCache,
    User,
    UserAchievement,
)


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


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('key', 'category', 'name', 'target', 'order', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('key', 'name')


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'unlocked_at')
    list_filter = ('achievement__category',)
    search_fields = ('user__email', 'achievement__name')


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'updated_at')
    search_fields = ('user__email',)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'role', 'created_at', 'short_content')
    list_filter = ('role',)
    search_fields = ('content',)

    @admin.display(description='Contenido')
    def short_content(self, obj):
        return obj.content[:60]


@admin.register(ChatQuota)
class ChatQuotaAdmin(admin.ModelAdmin):
    list_display = ('user', 'rank', 'rank_count', 'daily_date', 'daily_count')
    search_fields = ('user__email',)
