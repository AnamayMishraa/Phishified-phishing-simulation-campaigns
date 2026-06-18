from django.urls import path

from apps.landing_pages.views import PublicLandingPageView

urlpatterns = [
    path("<slug:slug>/", PublicLandingPageView.as_view(), name="public-landing-page"),
]
