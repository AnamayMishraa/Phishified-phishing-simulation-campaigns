import json
import logging

from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View

from apps.campaigns.models import CampaignAssignment
from apps.tracking.services import TRANSPARENT_GIF, TrackingService

logger = logging.getLogger(__name__)


class OpenTrackingView(View):
    def get(self, request, assignment_id):
        assignment = get_object_or_404(
            CampaignAssignment.objects.select_related("employee"),
            id=assignment_id,
        )

        try:
            TrackingService.record_open(assignment)
        except Exception:
            logger.exception(
                "Failed to record open for assignment %s", assignment_id
            )

        return HttpResponse(TRANSPARENT_GIF, content_type="image/gif")


class ClickTrackingView(View):
    def get(self, request, assignment_id):
        assignment = get_object_or_404(
            CampaignAssignment.objects.select_related(
                "employee", "campaign__landing_page"
            ),
            id=assignment_id,
        )

        try:
            slug = TrackingService.record_click(assignment, request)
        except Exception:
            logger.exception(
                "Failed to record click for assignment %s", assignment_id
            )
            slug = None

        if slug:
            redirect_url = f"/landing/{slug}/"
        else:
            redirect_url = "/"

        return HttpResponseRedirect(redirect_url)


class SubmitTrackingView(View):
    def post(self, request, assignment_id):
        assignment = get_object_or_404(
            CampaignAssignment.objects.select_related(
                "employee", "campaign__landing_page"
            ),
            id=assignment_id,
        )

        submitted_fields = []
        try:
            body = json.loads(request.body)
            submitted_fields = body.get("submitted_fields", [])
            if not isinstance(submitted_fields, list):
                submitted_fields = []
        except (json.JSONDecodeError, AttributeError):
            pass

        try:
            slug = TrackingService.record_submit(assignment, submitted_fields)
        except Exception:
            logger.exception(
                "Failed to record submit for assignment %s", assignment_id
            )
            slug = None

        if slug:
            redirect_url = f"/completion/{slug}/"
        else:
            redirect_url = "/completion/"

        return HttpResponseRedirect(redirect_url)


class ReportTrackingView(View):
    def get(self, request, assignment_id):
        assignment = get_object_or_404(
            CampaignAssignment.objects.select_related("employee"),
            id=assignment_id,
        )

        try:
            result = TrackingService.record_report(assignment)
        except Exception:
            logger.exception(
                "Failed to record report for assignment %s", assignment_id
            )
            return JsonResponse(
                {"status": "error", "detail": "Failed to record report"}, status=500
            )

        return JsonResponse(result)
