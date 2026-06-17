from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(email=email, password=password)
        if user is None:
            raise serializers.ValidationError(
                "Unable to log in with provided credentials.",
                code="authentication_failed",
            )
        if not user.is_active:
            raise serializers.ValidationError(
                "User account is disabled.", code="account_disabled"
            )

        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user,
        }

    def get_user(self, obj):
        return UserSerializer(obj["user"]).data


class RefreshSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.refresh_obj = None

    def validate(self, attrs):
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            token = RefreshToken(attrs["refresh"])
            token.blacklist()
        except Exception:
            raise serializers.ValidationError(
                "Invalid or expired refresh token.", code="token_invalid"
            )
        return attrs


class UserSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(source="organization.id", read_only=True)
    organization_name = serializers.CharField(
        source="organization.name", read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "role",
            "organization_id",
            "organization_name",
            "is_active",
            "preferences",
            "created_at",
            "updated_at",
        ]
