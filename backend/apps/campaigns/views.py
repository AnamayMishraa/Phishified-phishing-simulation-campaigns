from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.campaigns.models import Campaign, CampaignActivity, CampaignAssignment
from apps.campaigns.serializers import (
    CampaignActivitySerializer,
    CampaignAssignmentSerializer,
    CampaignDetailSerializer,
    CampaignListSerializer,
    CampaignWriteSerializer,
)
from apps.campaigns.services import CampaignLaunchError, CampaignService


class CampaignViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "description", "department"]
    ordering_fields = ["name", "status", "type", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Campaign.objects.filter(
            organization=self.request.user.organization
        ).select_related("email_template", "created_by")

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        type_param = self.request.query_params.get("type")
        if type_param:
            qs = qs.filter(type=type_param)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return CampaignListSerializer
        if self.action in ("create", "partial_update", "update"):
            return CampaignWriteSerializer
        return CampaignDetailSerializer

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status == "active":
            return Response(
                {"detail": "Cannot delete an active campaign. Pause it first."},
                status=status.HTTP_409_CONFLICT,
            )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def launch(self, request, pk=None):
        campaign = self.get_object()
        targeting = request.data.get("targeting")
        ip_address = request.META.get("REMOTE_ADDR")

        try:
            result = CampaignService.launch(
                campaign=campaign,
                user=request.user,
                targeting=targeting,
                ip_address=ip_address,
            )
            return Response(result)
        except CampaignLaunchError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def pause(self, request, pk=None):
        campaign = self.get_object()

        if campaign.status != "active":
            return Response(
                {"detail": "Only active campaigns can be paused."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        campaign.status = "paused"
        campaign.save(update_fields=["status"])

        CampaignActivity.objects.create(
            campaign=campaign,
            employee=None,
            activity_type="event",
            message=f"Campaign paused by {request.user.name}.",
        )

        return Response({"detail": "Campaign paused."})

    @action(detail=True, methods=["post"])
    def resume(self, request, pk=None):
        campaign = self.get_object()

        if campaign.status != "paused":
            return Response(
                {"detail": "Only paused campaigns can be resumed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        campaign.status = "active"
        campaign.save(update_fields=["status"])

        CampaignActivity.objects.create(
            campaign=campaign,
            employee=None,
            activity_type="event",
            message=f"Campaign resumed by {request.user.name}.",
        )

        return Response({"detail": "Campaign resumed."})


class CampaignAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CampaignAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CampaignAssignment.objects.filter(
            campaign__organization=self.request.user.organization,
            campaign_id=self.kwargs["campaign_pk"],
        ).select_related("employee")


class CampaignActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CampaignActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CampaignActivity.objects.filter(
            campaign__organization=self.request.user.organization,
            campaign_id=self.kwargs["campaign_pk"],
        ).select_related("employee")
