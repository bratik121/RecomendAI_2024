from django.http import JsonResponse
from .models import Movie, Interaction
from sklearn.preprocessing import MultiLabelBinarizer
from django.db.models import Case, When, Value, IntegerField
from django.db import models
import pandas as pd
from django.contrib.auth.models import User
from sklearn.ensemble import RandomForestClassifier
import numpy as np  # Importing numpy

def recommend_movies(request, idUser):
    if request.method == 'GET':
        try:
            # Fetch movies that have been seen by the user
            interactions = Interaction.objects.filter(user_id=idUser)
            seen_movies_ids = list(interactions.values_list('movie_id', flat=True))

            # Fetch all movies excluding those already seen
            all_movies = Movie.objects.exclude(id__in=seen_movies_ids)
            movies_data = {
                'id': [movie.id for movie in all_movies],
                'genres': [movie.genres if movie.genres and isinstance(movie.genres, list) else ['Unknown'] for movie in all_movies]
            }

            # Convert genres to DataFrame suitable for model training
            movies_df = pd.DataFrame(movies_data)
            mlb = MultiLabelBinarizer()
            genres_encoded = mlb.fit_transform(movies_df['genres'])
            genres_df = pd.DataFrame(genres_encoded, columns=mlb.classes_, index=movies_df.index)

            # Create a full DataFrame including movie IDs
            full_df = pd.concat([movies_df.drop(columns='genres'), genres_df], axis=1)

            # Prepare the training set
            training_data = full_df.loc[full_df.index.isin(seen_movies_ids)]
            X_train = training_data.drop(columns=['id'])
            y_train = [interaction.liked for interaction in interactions if interaction.movie_id in training_data.index]

            # Fit the model
            forest = RandomForestClassifier(n_estimators=100, random_state=42)
            forest.fit(X_train, y_train)

            # Predicting unseen movies
            unseen_movies = full_df.loc[~full_df.index.isin(seen_movies_ids)]
            X_unseen = unseen_movies.drop(columns=['id'])
            predicted_likes = forest.predict_proba(X_unseen)

            # Debugging output: Checking the shape of the predicted output
            if predicted_likes.shape[1] == 1:
                predicted_likes = np.hstack([1 - predicted_likes, predicted_likes])

            unseen_movies['like_probability'] = predicted_likes[:, 1]

            # Order preserved query for movies
            preserved_order = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(unseen_movies.index.tolist())], output_field=IntegerField())
            movies_queryset = Movie.objects.filter(id__in=unseen_movies.index).annotate(order=preserved_order).order_by('order')

            # Prepare response with correct format
            response_data = []
            for movie in movies_queryset[:10]:
                genres_list = [genre.name for genre in movie.genres.all()]  # Ensure Genre M2M relationship
                response_data.append({
                    'id': movie.id,
                    'title': movie.title,
                    'poster_path': movie.poster_path,
                    'release_year': movie.release_year.strftime('%Y') if movie.release_year else 'N/A',
                    'overview': movie.overview,
                    'genres': genres_list
                })

            return JsonResponse(response_data, safe=False)

        except Exception as e:
            # Log any exceptions that occur
            return JsonResponse({'error': str(e)}, status=500)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
