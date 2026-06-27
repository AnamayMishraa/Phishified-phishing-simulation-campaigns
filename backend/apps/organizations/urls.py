from django.urls import path

from apps.organizations.views import (
    DepartmentViewSet,
    InfrastructureSettingView,
    SendTestEmailView,
    ValidateDomainView,
    VerifySmtpView,
)

department_list = DepartmentViewSet.as_view({"get": "list", "post": "create"})
department_detail = DepartmentViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("departments/", department_list, name="department-list"),
    path("departments/<uuid:pk>/", department_detail, name="department-detail"),
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
