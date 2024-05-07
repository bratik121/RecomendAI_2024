from django.http import JsonResponse
from .models import Movie, Interaction
from sklearn.preprocessing import MultiLabelBinarizer
import pandas as pd
from django.contrib.auth.models import User
from sklearn.ensemble import RandomForestClassifier
import numpy as np

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

            # Check the shape of predicted output and adjust if necessary
            if predicted_likes.shape[1] == 1:
                if forest.classes_[0] == 1:
                    predicted_likes = np.hstack([1 - predicted_likes, predicted_likes])
                else:
                    predicted_likes = np.hstack([predicted_likes, 1 - predicted_likes])
            unseen_movies['like_probability'] = predicted_likes[:, 1]

            # Sort by probability of being liked
            recommended_movies = unseen_movies.sort_values(by='like_probability', ascending=False)

            # Prepare and send response
            response_data = []
            count = 0
            for id, prob in recommended_movies['like_probability'].items():
                if count >= 10:
                    break
                try:
                    movie = Movie.objects.get(id=id)
                    response_data.append({
                        'id': movie.id,
                        'title': movie.title,
                        'poster_path': movie.poster_path,
                        'release_year': movie.release_year,
                        'overview': movie.overview,
                        'genres': movie.genres if isinstance(movie.genres, list) else movie.genres.split(', ')
                    })
                    count += 1
                except Movie.DoesNotExist:
                    continue  # Ignore movies that do not exist

            return JsonResponse(response_data, safe=False)

        except Exception as e:
            # Log any exceptions that occur
            return JsonResponse({'error': str(e)}, status=500)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
