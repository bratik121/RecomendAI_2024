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
        movies_df['year'] = pd.to_datetime(movies_df['release_date']).dt.year
        movies_df['genres'] = movies_df['genres'].str.split('-')
        movies_df['year'].fillna(0, inplace=True)
        # Procesar y cargar cada película
        for _, row in movies_df.iterrows():
            Movie.objects.create(
                title=row['title'],
                poster_path=row['poster_path'],
                release_year=str(int(row['year'])),
                overview=row['overview'],
                genres=row['genres'],
            )
        self.stdout.write(self.style.SUCCESS('Successfully loaded all movies from CSV.'))
