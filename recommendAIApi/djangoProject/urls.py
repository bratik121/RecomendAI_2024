"""
URL configuration for djangoProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from App import views
from App.login_view import login_view
from App.rateMovies_view import rateMovies
from App.interactions_view import interactions
from App.tenmovies_view import tenmovies
from App.remomendMovies_view import recommend_movies
from rest_framework import routers
from App.search_movies_by_name import search_movies_by_name
from App.comment_views import CommentDetailView, CommentListCreateView
from App.movie_views import MovieDetailView
from App.profile_views import AvatarDeleteView, ProfileView
from App.rating_views import MovieRatingsView, RatingCreateView, RatingDetailView
from App.watchlist_views import WatchlistSummaryView, WatchlistViewSet

from App.views import UserViewSet

route = routers.DefaultRouter()

route.register("User", UserViewSet, basename="User")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(route.urls)),
    path('api/auth/login', login_view, name='login'),
    path('api/rateMovies', rateMovies, name='rateMovies'),
    path('api/interactions/<int:idUser>/', interactions, name='interactions'),
    path('api/tenmovies/<int:idUser>/', tenmovies, name='te nmovies'),
    path('api/recommend/<int:idUser>/', recommend_movies, name='recommend'),
    path('api/searchMoviesByName/', search_movies_by_name, name='searchMoviesByName'),
    path('api/movies/<int:pk>/', MovieDetailView.as_view(), name='movie-detail'),
    path(
        'api/movies/<int:movie_id>/comments/',
        CommentListCreateView.as_view(),
        name='movie-comments',
    ),
    path('api/comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/profile/avatar/', AvatarDeleteView.as_view(), name='profile-avatar'),
    path('api/ratings/', RatingCreateView.as_view(), name='rating-create'),
    path('api/ratings/<int:pk>/', RatingDetailView.as_view(), name='rating-detail'),
    path('api/movies/<int:pk>/ratings/', MovieRatingsView.as_view(), name='movie-ratings'),
    path('api/watchlist/', WatchlistViewSet.as_view({'get': 'list', 'post': 'create'}), name='watchlist'),
    path('api/watchlist/summary/', WatchlistSummaryView.as_view(), name='watchlist-summary'),
    path(
        'api/watchlist/<int:pk>/',
        WatchlistViewSet.as_view({'patch': 'partial_update', 'delete': 'destroy'}),
        name='watchlist-detail',
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
