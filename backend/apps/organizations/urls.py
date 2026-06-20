from django.urls import path

from apps.organizations.views import (
    InfrastructureSettingView,
    SendTestEmailView,
    ValidateDomainView,
    VerifySmtpView,
)

urlpatterns = [
    path(
        "infrastructure/",
        InfrastructureSettingView.as_view(),
        name="infrastructure-settings",
    ),
    path(
        "infrastructure/verify-smtp/",
        VerifySmtpView.as_view(),
        name="infrastructure-verify-smtp",
    ),
    path(
        "infrastructure/send-test-email/",
        SendTestEmailView.as_view(),
        name="infrastructure-send-test-email",
    ),
    path(
        "infrastructure/validate-domain/",
        ValidateDomainView.as_view(),
        name="infrastructure-validate-domain",
    ),
]
