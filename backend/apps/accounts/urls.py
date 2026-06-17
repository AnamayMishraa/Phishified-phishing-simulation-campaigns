from django.urls import path

from apps.accounts.views import (
    login_view,
    logout_view,
    current_user_view,
    CustomTokenRefreshView,
)

urlpatterns = [
    path("login/", login_view, name="auth-login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="auth-refresh"),
    path("logout/", logout_view, name="auth-logout"),
    path("me/", current_user_view, name="auth-me"),
]
