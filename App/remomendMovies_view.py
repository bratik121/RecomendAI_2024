from django.http import JsonResponse
from .models import Movie, Interaction
from sklearn.preprocessing import MultiLabelBinarizer
import pandas as pd
from django.contrib.auth.models import User
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score


import numpy as np
def recommend_movies(request, idUser):
    if request.method == 'GET':
        try:
            # Fetch movies that have been seen by the user
            interactions = Interaction.objects.filter(user_id=idUser)
            seen_movies_ids = list(interactions.values_list('movie_id', flat=True))

            print("interactions")
            print(interactions)
            

           
            
            all_movies = Movie.objects.all()
            movies_data = {
                'id': [movie.id for movie in all_movies],
                'genres': [movie.genres if movie.genres and isinstance(movie.genres, list) else ['Unknown'] for movie in all_movies],
                'popularity': [movie.popularity for movie in all_movies],
                'vote_average': [movie.vote_average for movie in all_movies],
                'revenue': [movie.revenue for movie in all_movies],
            }

            # Convert genres to DataFrame suitable for model training
            movies_df = pd.DataFrame(movies_data)

            print("Movies_df")
            print(movies_df)

            mlb = MultiLabelBinarizer()
            genres_encoded = mlb.fit_transform(movies_df['genres'])
            genres_df = pd.DataFrame(genres_encoded, columns=mlb.classes_, index=movies_df.index)

            print("Genres_df")
            print(genres_df)

            # Create a full DataFrame including movie IDs
            full_df = pd.concat([movies_df.drop(columns='genres'), genres_df], axis=1)

            # Prepare the training set
            training_data = full_df
            X_train = training_data.drop(columns=['id'])

            # Fetch all movie_id and liked values from the database at once
            interaction_data = interactions.values_list('movie_id', 'liked')
            y_train = []
            # Convert it to a dictionary for faster access
            interaction_dict = {movie_id: int(liked) for movie_id, liked in interaction_data}

            # Now iterate over the training data
            for index, row in training_data.iterrows():
              # Use the dictionary instead of making a database query
              liked = interaction_dict.get(row['id'], 0)
              y_train.append(liked)  # Change this line

            y_train = pd.Series(y_train)  # And this line

            print("X_train")
            print(X_train)

            print("Y_train")
            print(y_train)
            print(len(y_train))

            # Fit the model
            forest = RandomForestClassifier(n_estimators=50)
            forest.fit(X_train, y_train.values.ravel())

            # Predicting unseen movies
            unseen_movies = full_df.loc[~full_df['id'].isin(seen_movies_ids)]

            X_unseen = unseen_movies.drop(columns=['id'])
            print("x_unseen")
            print(X_unseen)
            predicted_likes = forest.predict_proba(X_unseen)

            #Check the shape of predicted output and adjust if necessary
            if predicted_likes.shape[1] == 1:
                if forest.classes_[0] == 1:
                    predicted_likes = np.hstack([1 - predicted_likes, predicted_likes])
                else:
                    predicted_likes = np.hstack([predicted_likes, 1 - predicted_likes])



            # Add the probabilities to the DataFrame
                    
            unseen_movies['like_probability'] = predicted_likes[:, 1]

            # Sort by probability of being liked
            recommended_movies = unseen_movies.sort_values(by='like_probability', ascending=False)
     

            print("Recommended movies")
            print(recommended_movies)
            # Prepare and send response
            response_data = []
            count = 0
            for _, row in recommended_movies.iterrows():
                if count >= 20:
                    break
                try:
                    movie = Movie.objects.get(id=row['id'])
                    response_data.append({
                        'id': movie.id,
                        'title': movie.title,
                        'poster_path': movie.poster_path,
                        'release_year': movie.release_year,
                        'vote_average': movie.vote_average,
                        'overview': movie.overview,
                        'genres': movie.genres if isinstance(movie.genres, list) else (movie.genres.split(', ') if isinstance(movie.genres, str) else [])
                    })
                    count += 1
                except Movie.DoesNotExist:
                    continue  # Ignore movies that do not exist
                
            # shffleing and sewnding the first 10

            np.random.shuffle(response_data)

            response_data = response_data[:10]

            return JsonResponse(response_data, safe=False)

        except Exception as e:
            # Log any exceptions that occur
            return JsonResponse({'error': str(e)}, status=500)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
