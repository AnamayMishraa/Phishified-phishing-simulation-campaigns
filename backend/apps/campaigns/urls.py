from django.urls import path

from apps.campaigns.views import (
    CampaignActivityViewSet,
    CampaignAssignmentViewSet,
    CampaignViewSet,
)

campaign_list = CampaignViewSet.as_view({"get": "list", "post": "create"})
campaign_detail = CampaignViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)
campaign_launch = CampaignViewSet.as_view({"post": "launch"})
campaign_pause = CampaignViewSet.as_view({"post": "pause"})
campaign_resume = CampaignViewSet.as_view({"post": "resume"})
campaign_export_csv = CampaignViewSet.as_view({"get": "export_csv"})
assignment_list = CampaignAssignmentViewSet.as_view({"get": "list"})
activity_list = CampaignActivityViewSet.as_view({"get": "list"})

urlpatterns = [
    path("", campaign_list, name="campaign-list"),
    path("<uuid:pk>/", campaign_detail, name="campaign-detail"),
    path("<uuid:pk>/launch/", campaign_launch, name="campaign-launch"),
    path("<uuid:pk>/pause/", campaign_pause, name="campaign-pause"),
    path("<uuid:pk>/resume/", campaign_resume, name="campaign-resume"),
    path(
        "<uuid:pk>/export-csv/",
        campaign_export_csv,
        name="campaign-export-csv",
    ),
    path(
        "<uuid:campaign_pk>/assignments/",
        assignment_list,
        name="campaign-assignments",
    ),
    path(
        "<uuid:campaign_pk>/activities/",
        activity_list,
        name="campaign-activities",
    ),
]
