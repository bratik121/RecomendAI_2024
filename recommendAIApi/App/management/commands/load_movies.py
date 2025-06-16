from django.core.management.base import BaseCommand
import pandas as pd
from App.models import Movie

class Command(BaseCommand):
    help = 'Load a list of movies from a CSV file into the database'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file containing movie data.')

    def handle(self, *args, **options):
        # Leer el DataFrame
        movies_df = pd.read_csv(options['csv_file'])
        max_popularity = movies_df['popularity'].max()
        max_revenue = movies_df['revenue'].max()
        movies_df['year'] = pd.to_datetime(movies_df['release_date']).dt.year
        movies_df['genres'] = movies_df['genres'].str.split('-')
        movies_df['year'].fillna(0, inplace=True)
        movies_df['popularity'] = movies_df['popularity'] / max_popularity
        movies_df['vote_average'] = movies_df['vote_average'] / 10
        movies_df['revenue'] = movies_df['revenue'] / max_revenue

        # Procesar y cargar cada película
        for _, row in movies_df.iterrows():
            # Verificar si todos los campos necesarios están presentes y no son nulos
            if row[['title', 'poster_path', 'year', 'overview', 'popularity', 'vote_average', 'revenue', 'genres']].isna().any():
                self.stdout.write(self.style.WARNING(f'Skipping movie with missing fields: {row["title"] if pd.notna(row["title"]) else "Unknown Title"}'))
                continue

            # Crear y guardar la película
            Movie.objects.create(
                title=row['title'],
                poster_path=row['poster_path'],
                release_year=str(int(row['year'])),
                overview=row['overview'],
                popularity=row['popularity'],
                vote_average=row['vote_average'],
                revenue=row['revenue'],
                genres=row['genres'],
            )

        self.stdout.write(self.style.SUCCESS('Successfully loaded all movies from CSV.'))
