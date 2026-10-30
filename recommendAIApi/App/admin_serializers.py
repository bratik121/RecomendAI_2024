"""Serializers para la API de administración (prefijo /api/admin/)."""

from rest_framework import serializers

from .models import Movie, Rank, Role, User


class AdminMovieSerializer(serializers.ModelSerializer):
    """CRUD de películas desde el panel de administración.

    El poster (`poster_image`) es inmutable una vez asignado: si la película
    ya tiene poster, no se permite reemplazarlo.
    """

    poster_url = serializers.SerializerMethodField()
    genres = serializers.JSONField(required=False, default=list)

    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'poster_path',
            'poster_image',
            'poster_url',
            'release_year',
            'overview',
            'popularity',
            'vote_average',
            'revenue',
            'genres',
            'is_active',
        ]
        read_only_fields = ['id', 'poster_url']

    def get_poster_url(self, obj):
        if obj.poster_image:
            request = self.context.get('request')
            url = obj.poster_image.url
            if request is not None and not str(url).startswith(('http://', 'https://')):
                return request.build_absolute_uri(url)
            return url
        return None

    def validate_poster_image(self, value):
        if value is None:
            return value
        if value.content_type not in ('image/jpeg', 'image/png', 'image/webp'):
            raise serializers.ValidationError(
                'Formato no permitido. Usá JPG, PNG o WebP.'
            )
        if value.size > 8 * 1024 * 1024:
            raise serializers.ValidationError('La imagen supera los 8 MB.')
        try:
            from PIL import Image

            image = Image.open(value)
            image.verify()
        except Exception:
            raise serializers.ValidationError('El archivo no es una imagen válida.')
        return value

    def validate_genres(self, value):
        """Los géneros deben ser un array de strings (trim + sin duplicados)."""
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('Los géneros deben ser una lista de textos.')
        cleaned = []
        for genre in value:
            if not isinstance(genre, str):
                raise serializers.ValidationError('Cada género debe ser un texto.')
            genre = genre.strip()
            if genre and genre not in cleaned:
                cleaned.append(genre)
        return cleaned

    def update(self, instance, validated_data):
        if 'poster_image' in validated_data and validated_data.get('poster_image') is not None:
            if instance.poster_image:
                raise serializers.ValidationError(
                    {'poster_image': 'La película ya tiene un poster y no puede modificarse.'}
                )
        return super().update(instance, validated_data)


class AdminUserSerializer(serializers.ModelSerializer):
    """CRUD de usuarios desde el panel de administración.

    La contraseña es opcional en edición (si se omite, no se modifica).
    El campo `role` es de solo lectura aquí; el cambio de rol se hace por
    la acción dedicada `set_role`, que aplica reglas de seguridad.
    """

    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, min_length=8
    )
    rank = serializers.ChoiceField(
        choices=Rank.choices, required=False, allow_blank=True
    )
    rank_color = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'name',
            'lastname',
            'bio',
            'avatar',
            'role',
            'rank',
            'rank_color',
            'is_active',
            'created_at',
            'password',
        ]
        read_only_fields = ['id', 'role', 'created_at', 'avatar', 'rank_color']

    def get_rank_color(self, obj):
        from App.achievement_service import get_user_rank
        return get_user_rank(obj)['color']

    def validate_email(self, value):
        value = User.objects.normalize_email(value)
        qs = User.objects.filter(email=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ya existe un usuario con ese email.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria al crear un usuario.'})
        # Los usuarios creados por un admin siempre nacen con rol `user`.
        validated_data['role'] = Role.USER
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


class RoleUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[Role.ROOT, Role.ADMIN, Role.USER])
