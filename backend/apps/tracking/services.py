import logging

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.campaigns.models import Campaign, CampaignActivity, CampaignAssignment
from apps.employees.services import RiskService
from apps.landing_pages.models import LandingPageVisit

logger = logging.getLogger(__name__)

TRANSPARENT_GIF = (
    b"GIF89a\x01\x00\x01\x00\x80\x01\x00\x00"
    b"\x00\x00\xff\xff\xff!\xf9\x04\x01\x0a\x00"
    b"\x01\x00,\x00\x00\x00\x00\x01\x00\x01\x00"
    b"\x00\x02\x02L\x01\x00;"
)


class TrackingError(Exception):
    pass


class TrackingService:
    @staticmethod
    def record_open(assignment: CampaignAssignment) -> None:
        with transaction.atomic():
            if not assignment.opened_at:
                assignment.opened_at = timezone.now()
                assignment.save(update_fields=["opened_at"])

            Campaign.objects.filter(
                id=assignment.campaign_id,
            ).update(open_count=F("open_count") + 1)

            CampaignActivity.objects.create(
                campaign_id=assignment.campaign_id,
                employee=assignment.employee,
                activity_type="opened",
                message=(
                    f"Email opened by "
                    f"{assignment.employee.first_name} {assignment.employee.last_name}"
                ),
            )

        try:
            RiskService.on_open(assignment.employee, assignment.campaign)
        except Exception:
            logger.exception(
                "Failed to update risk score on open for assignment %s",
                assignment.id,
            )

    @staticmethod
    def record_click(assignment: CampaignAssignment, request) -> str | None:
        with transaction.atomic():
            if not assignment.clicked_at:
                assignment.clicked_at = timezone.now()
                assignment.save(update_fields=["clicked_at"])

            Campaign.objects.filter(
                id=assignment.campaign_id,
            ).update(click_count=F("click_count") + 1)

            CampaignActivity.objects.create(
                campaign_id=assignment.campaign_id,
                employee=assignment.employee,
                activity_type="clicked",
                message=(
                    f"Phishing link clicked by "
                    f"{assignment.employee.first_name} {assignment.employee.last_name}"
                ),
            )

        try:
            RiskService.on_click(assignment.employee, assignment.campaign)
        except Exception:
            logger.exception(
                "Failed to update risk score on click for assignment %s",
                assignment.id,
            )

        landing_page = assignment.campaign.landing_page

        if landing_page:
            try:
                LandingPageVisit.objects.create(
                    landing_page=landing_page,
                    employee=assignment.employee,
                    ip_address=request.META.get("REMOTE_ADDR"),
                    user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
                )
            except Exception:
                logger.exception(
                    "Failed to create landing page visit for assignment %s",
                    assignment.id,
                )
            return landing_page.slug

        return None

    @staticmethod
    def record_submit(
        assignment: CampaignAssignment, submitted_fields: list[str]
    ) -> str | None:
        with transaction.atomic():
            if not assignment.submitted_at:
                assignment.submitted_at = timezone.now()
                assignment.save(update_fields=["submitted_at"])

            Campaign.objects.filter(
                id=assignment.campaign_id,
            ).update(submission_count=F("submission_count") + 1)

            CampaignActivity.objects.create(
                campaign_id=assignment.campaign_id,
                employee=assignment.employee,
                activity_type="submitted",
                metadata={"submitted_fields": submitted_fields},
                message=(
                    f"Credentials submitted by "
                    f"{assignment.employee.first_name} {assignment.employee.last_name}"
                ),
            )

        try:
            RiskService.on_submit(assignment.employee, assignment.campaign)
        except Exception:
            logger.exception(
                "Failed to update risk score on submit for assignment %s",
                assignment.id,
            )

        landing_page = assignment.campaign.landing_page
        if landing_page:
            try:
                LandingPageVisit.objects.filter(
                    landing_page=landing_page,
                    employee=assignment.employee,
                    submitted_credentials=False,
                ).update(
                    submitted_credentials=True,
                    submitted_at=assignment.submitted_at or timezone.now(),
                )
            except Exception:
                logger.exception(
                    "Failed to update landing page visit for assignment %s",
                    assignment.id,
                )
            return landing_page.slug

        return None

    @staticmethod
    def record_report(assignment: CampaignAssignment) -> dict:
        with transaction.atomic():
            if not assignment.reported_at:
                assignment.reported_at = timezone.now()
                assignment.save(update_fields=["reported_at"])

            Campaign.objects.filter(
                id=assignment.campaign_id,
            ).update(report_count=F("report_count") + 1)

            CampaignActivity.objects.create(
                campaign_id=assignment.campaign_id,
                employee=assignment.employee,
                activity_type="reported",
                message=(
                    f"Phishing email reported by "
                    f"{assignment.employee.first_name} {assignment.employee.last_name}"
                ),
            )

        try:
            RiskService.on_report(assignment.employee)
        except Exception:
            logger.exception(
                "Failed to update risk score on report for assignment %s",
                assignment.id,
            )

        return {"status": "success", "reported_at": str(assignment.reported_at or timezone.now())}
