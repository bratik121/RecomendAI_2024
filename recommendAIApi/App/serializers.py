from rest_framework import serializers
from .models import User, Movie, Comment
from django.contrib.auth.hashers import make_password



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'lastname', 'is_active', 'is_staff']
        read_only_fields = ['is_active', 'is_staff']
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
        ]


class CommentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'lastname']


class CommentReplySerializer(serializers.ModelSerializer):
    user = CommentUserSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()

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
        ]
        read_only_fields = fields

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
