"""Vistas de administración bajo el prefijo /api/admin/.

Todos los endpoints exigen rol `admin` o `root`. Las acciones que cambian el
rol de otros usuarios exigen `root`.
"""

from django.db.models import Q
from django.utils import timezone
from rest_framework import decorators, mixins, permissions, status, viewsets
from rest_framework.response import Response

from .admin_serializers import AdminMovieSerializer, AdminUserSerializer, RoleUpdateSerializer
from .models import Comment, Movie, Role, User
from .permissions import IsAppAdmin, IsRoot
from .serializers import CommentSerializer


from rest_framework.pagination import PageNumberPagination


class AdminPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class MovieAdminViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """CRUD de películas. El borrado es lógico (archivado)."""

    serializer_class = AdminMovieSerializer
    permission_classes = [IsAppAdmin]
    pagination_class = AdminPageNumberPagination
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        qs = Movie.objects.all().order_by('-id')
        active = self.request.query_params.get('active')
        if active in ('true', 'false'):
            qs = qs.filter(is_active=active == 'true')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)
        return qs

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @decorators.action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = True
        instance.save(update_fields=['is_active'])
        return Response(self.get_serializer(instance).data)


class UserAdminViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """CRUD de usuarios. El borrado lógico se hace por `deactivate`/`activate`.

    - `admin` gestiona solo usuarios comunes (no admins ni root).
    - `root` gestiona a todos, y es el único que cambia roles.
    """

    serializer_class = AdminUserSerializer
    permission_classes = [IsAppAdmin]
    pagination_class = AdminPageNumberPagination
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        qs = User.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(name__icontains=search)
                | Q(lastname__icontains=search)
            )
        role = self.request.query_params.get('role')
        if role in {Role.ROOT, Role.ADMIN, Role.USER}:
            qs = qs.filter(role=role)
        active = self.request.query_params.get('is_active')
        if active in ('true', 'false'):
            qs = qs.filter(is_active=active == 'true')
        return qs

    def _assert_can_manage(self, target: User):
        actor = self.request.user
        if target.pk == actor.pk:
            return False
        if actor.is_root:
            return True
        # Un admin solo puede gestionar usuarios comunes.
        return target.role == Role.USER

    def _assert_no_last_root(self, target: User):
        """No se puede desactivar ni demover al último root activo."""
        if target.role == Role.ROOT and target.is_active:
            remaining = User.objects.filter(role=Role.ROOT, is_active=True).exclude(pk=target.pk)
            if not remaining.exists():
                return False
        return True

    def _guard(self, target: User):
        if not self._assert_can_manage(target):
            return Response(
                {'detail': 'No tenés permisos para modificar a este usuario.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def destroy(self, request, *args, **kwargs):
        target = self.get_object()
        blocked = self._guard(target)
        if blocked:
            return blocked
        if not self._assert_no_last_root(target):
            return Response(
                {'detail': 'No se puede desactivar al último root activo.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        target.is_active = False
        target.save(update_fields=['is_active'])
        return Response(self.get_serializer(target).data)

    @decorators.action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        target = self.get_object()
        blocked = self._guard(target)
        if blocked:
            return blocked
        target.is_active = True
        target.save(update_fields=['is_active'])
        return Response(self.get_serializer(target).data)

    @decorators.action(detail=True, methods=['post'], permission_classes=[IsAppAdmin, IsRoot])
    def set_role(self, request, pk=None):
        target = self.get_object()
        serializer = RoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data['role']

        if target.pk == request.user.pk:
            return Response(
                {'detail': 'No podés cambiar tu propio rol.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if target.role == Role.ROOT and new_role != Role.ROOT:
            if not self._assert_no_last_root(target):
                return Response(
                    {'detail': 'No se puede demover al último root activo.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        target.role = new_role
        # Los admins/root deben poder entrar al Django Admin si corresponde.
        target.is_staff = new_role in (Role.ADMIN, Role.ROOT)
        target.save(update_fields=['role', 'is_staff'])
        return Response(self.get_serializer(target).data)


class CommentAdminViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Listado y moderación de comentarios."""

    serializer_class = CommentSerializer
    permission_classes = [IsAppAdmin]
    pagination_class = AdminPageNumberPagination
    http_method_names = ['get', 'post']

    def get_queryset(self):
        qs = (
            Comment.objects.select_related('user', 'movie')
            .prefetch_related('replies')
            .order_by('-created_at')
        )
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(body__icontains=search)
        is_deleted = self.request.query_params.get('is_deleted')
        if is_deleted in ('true', 'false'):
            qs = qs.filter(is_deleted=is_deleted == 'true')
        return qs

    @decorators.action(detail=True, methods=['post'])
    def moderate(self, request, pk=None):
        """Marca el comentario como eliminado (soft delete)."""
        comment = self.get_object()
        comment.is_deleted = True
        comment.body = ''
        comment.save(update_fields=['is_deleted', 'body', 'updated_at'])
        return Response(self.get_serializer(comment).data)

    @decorators.action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        comment = self.get_object()
        if comment.is_deleted:
            # Sin contenido original no podemos restaurarlo; dejamos el
            # flag a false solo si hay cuerpo que recuperar.
            return Response(
                {'detail': 'El contenido fue eliminado y no se puede restaurar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(self.get_serializer(comment).data)
