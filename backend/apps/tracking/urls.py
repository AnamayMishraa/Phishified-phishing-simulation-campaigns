from django.urls import path

from apps.tracking.views import (
    ClickTrackingView,
    OpenTrackingView,
    ReportTrackingView,
    SubmitTrackingView,
)

urlpatterns = [
    path("open/<uuid:assignment_id>/", OpenTrackingView.as_view(), name="track-open"),
    path("click/<uuid:assignment_id>/", ClickTrackingView.as_view(), name="track-click"),
    path("submit/<uuid:assignment_id>/", SubmitTrackingView.as_view(), name="track-submit"),
    path("report/<uuid:assignment_id>/", ReportTrackingView.as_view(), name="track-report"),
]
