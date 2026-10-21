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
