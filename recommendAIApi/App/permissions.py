from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Permite lectura a cualquiera y escritura solo al autor."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.user_id == request.user.id
        )


class IsAppAdmin(permissions.BasePermission):
    """Permite el acceso solo a usuarios autenticados con rol admin o root."""

    message = 'Se requiere un usuario administrador.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and getattr(request.user, 'is_admin', False)
        )


class IsRoot(permissions.BasePermission):
    """Permite el acceso solo a usuarios autenticados con rol root."""

    message = 'Se requiere un usuario root.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and getattr(request.user, 'is_root', False)
        )
