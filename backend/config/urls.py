from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.organizations.urls")),
    path("api/v1/employees/", include("apps.employees.urls")),
    path("api/v1/templates/", include("apps.templates.urls")),
    path("api/v1/landing-pages/", include("apps.landing_pages.urls")),
    path("api/v1/campaigns/", include("apps.campaigns.urls")),
    path("api/v1/training/", include("apps.training.urls")),
    path("api/v1/reports/", include("apps.reports.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/dashboard/", include("apps.dashboard.urls")),
]
