from django.urls import path

from apps.reports.views import ReportViewSet

report_list = ReportViewSet.as_view({"get": "list"})
report_detail = ReportViewSet.as_view({"get": "retrieve"})

urlpatterns = [
    path("", report_list, name="report-list"),
    path("<uuid:pk>/", report_detail, name="report-detail"),
]
