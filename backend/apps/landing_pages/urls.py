from django.urls import path

from apps.landing_pages.views import LandingPageViewSet

landing_page_list = LandingPageViewSet.as_view({"get": "list", "post": "create"})
landing_page_detail = LandingPageViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("", landing_page_list, name="landing-page-list"),
    path("<uuid:pk>/", landing_page_detail, name="landing-page-detail"),
]
