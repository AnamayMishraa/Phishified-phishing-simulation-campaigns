import json
import logging

from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

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

        base = settings.FRONTEND_BASE_URL.rstrip("/")
        if slug:
            redirect_url = f"{base}/landing/{slug}/?aid={assignment_id}"
        else:
            redirect_url = f"{base}/"

        return HttpResponseRedirect(redirect_url)


@method_decorator(csrf_exempt, name="dispatch")
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
            base = settings.FRONTEND_BASE_URL.rstrip("/")
            redirect_url = f"{base}/completion/{slug}/"
        else:
            base = settings.FRONTEND_BASE_URL.rstrip("/")
            redirect_url = f"{base}/completion/"

        return HttpResponseRedirect(redirect_url)


class ReportTrackingView(View):
    def get(self, request, assignment_id):
        assignment = get_object_or_404(
            CampaignAssignment.objects.select_related("employee"),
            id=assignment_id,
        )

        try:
            TrackingService.record_report(assignment)
        except Exception:
            logger.exception(
                "Failed to record report for assignment %s", assignment_id
            )

        base = settings.FRONTEND_BASE_URL.rstrip("/")
        redirect_url = f"{base}/completion/"
        return HttpResponseRedirect(redirect_url)
