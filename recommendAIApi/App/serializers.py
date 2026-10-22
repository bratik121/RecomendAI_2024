from rest_framework import serializers
from .models import User, Movie, Comment, Interaction, WatchlistItem
from django.contrib.auth.hashers import make_password



class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'lastname', 'bio', 'avatar', 'is_active', 'is_staff']
        read_only_fields = ['is_active', 'is_staff', 'bio', 'avatar']
        extra_kwargs = {
            'password': {'write_only': True}  # Esto hace que la contraseña no sea retornada en las respuestas de la API
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)


class MovieSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'poster_path',
            'release_year',
            'overview',
            'popularity',
            'vote_average',
            'revenue',
            'genres',
            'average_rating',
            'ratings_count',
        ]

    def get_average_rating(self, obj):
        value = getattr(obj, 'average_rating', None)
        return round(float(value), 1) if value is not None else None

    def get_ratings_count(self, obj):
        return getattr(obj, 'ratings_count', 0) or 0


class CommentUserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'lastname', 'avatar']

    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url


class CommentReplySerializer(serializers.ModelSerializer):
    user = CommentUserSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()
    author_liked = serializers.SerializerMethodField()
    author_rating = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'body',
            'created_at',
            'updated_at',
            'is_deleted',
            'is_edited',
            'can_edit',
            'user',
            'parent',
            'author_liked',
            'author_rating',
        ]
        read_only_fields = fields

    def get_author_social(self, obj):
        social = self.context.get('social_by_user') or {}
        if social:
            item = social.get(obj.user_id)
            if item:
                return item
        interactions = getattr(obj.user, 'movie_interaction', None) or []
        if interactions:
            item = interactions[0]
            return {'liked': item.liked, 'rating': item.rating}
        return {}

    def get_author_liked(self, obj):
        return bool(self.get_author_social(obj).get('liked'))

    def get_author_rating(self, obj):
        return self.get_author_social(obj).get('rating')

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return bool(
            request
            and request.user.is_authenticated
            and obj.user_id == request.user.id
            and not obj.is_deleted
        )

    def get_is_edited(self, obj):
        return (obj.updated_at - obj.created_at).total_seconds() > 1

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_deleted:
            data['body'] = ''
        return data


class CommentSerializer(CommentReplySerializer):
    replies = serializers.SerializerMethodField()
    body = serializers.CharField(min_length=2, max_length=1000, trim_whitespace=True)

    class Meta(CommentReplySerializer.Meta):
        fields = CommentReplySerializer.Meta.fields + ['replies']
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'is_edited',
            'can_edit',
            'user',
            'replies',
        ]

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentReplySerializer(
            replies, many=True, context=self.context
        ).data

    def validate_body(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('El comentario no puede estar vacío.')
        return value

    def validate_parent(self, parent):
        if parent is None:
            return parent

        movie = self.context.get('movie')
        if movie is not None and parent.movie_id != movie.id:
            raise serializers.ValidationError(
                'El comentario padre pertenece a otra película.'
            )
        if parent.parent_id is not None:
            raise serializers.ValidationError(
                'Solo se puede responder a un comentario raíz.'
            )
        if parent.is_deleted:
            raise serializers.ValidationError(
                'No se puede responder a un comentario eliminado.'
            )
        return parent

    def create(self, validated_data):
        return Comment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if instance.is_deleted:
            raise serializers.ValidationError('No se puede editar un comentario eliminado.')
        validated_data.pop('parent', None)
        return super().update(instance, validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'lastname', 'email', 'bio', 'avatar']
        read_only_fields = ['id', 'email']

    def validate_avatar(self, value):
        if value is None:
            return value
        if value.content_type not in ('image/jpeg', 'image/png', 'image/webp'):
            raise serializers.ValidationError(
                'Formato no permitido. Usá JPG, PNG o WebP.'
            )
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError('La imagen supera los 2 MB.')
        try:
            from PIL import Image

            image = Image.open(value)
            image.verify()
        except Exception:
            raise serializers.ValidationError('El archivo no es una imagen válida.')
        return value

    def update(self, instance, validated_data):
        avatar = validated_data.pop('avatar', None)
        if 'avatar' in self.initial_data and avatar is None:
            # Borrar avatar explícito (PATCH con avatar vacío no aplica; se usa DELETE).
            pass
        if avatar is not None:
            old_avatar = instance.avatar
            validated_data['avatar'] = self._resize_avatar(avatar)
            if old_avatar:
                old_avatar.delete(save=False)
        return super().update(instance, validated_data)

    def _resize_avatar(self, uploaded):
        from io import BytesIO

        from PIL import Image

        image = Image.open(uploaded)
        image = image.convert('RGB')
        image.thumbnail((512, 512), Image.LANCZOS)

        buffer = BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        uploaded.file = buffer
        uploaded.name = uploaded.name.rsplit('.', 1)[0] + '.jpg'
        return uploaded


class RatingSerializer(serializers.ModelSerializer):
    score = serializers.IntegerField(
        source='rating', min_value=1, max_value=5
    )

    class Meta:
        model = Interaction
        fields = ['id', 'movie', 'score', 'rated_at', 'liked']
        read_only_fields = ['id', 'rated_at', 'liked']


class WatchlistSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = WatchlistItem
        fields = ['id', 'movie', 'movie_id', 'watched', 'watched_at', 'created_at']
        read_only_fields = ['id', 'movie', 'watched_at', 'created_at']

    def create(self, validated_data):
        movie_id = validated_data.pop('movie_id')
        validated_data.pop('user', None)
        movie = Movie.objects.get(pk=movie_id)
        user = self.context['request'].user
        return WatchlistItem.objects.create(user=user, movie=movie, **validated_data)
