import logging

from django.db import transaction
from django.utils import timezone

from apps.audit.services import AuditService
from apps.campaigns.models import Campaign, CampaignActivity, CampaignAssignment, CampaignStatus
from apps.employees.models import Employee
from apps.notifications.services import NotificationService

logger = logging.getLogger(__name__)


class CampaignLaunchError(Exception):
    pass


class CampaignService:
    @staticmethod
    def validate_campaign(campaign: Campaign) -> None:
        if campaign.status != "draft":
            raise CampaignLaunchError(
                f"Cannot launch campaign in status '{campaign.status}'. Only draft campaigns can be launched."
            )

        if campaign.type == "email" and not campaign.email_template:
            raise CampaignLaunchError(
                "Email campaigns require an email template. Set one before launching."
            )

        if campaign.email_template and not campaign.email_template.is_active:
            raise CampaignLaunchError(
                f"Email template '{campaign.email_template.name}' is inactive."
            )

        if campaign.landing_page and not campaign.landing_page.is_active:
            raise CampaignLaunchError(
                f"Landing page '{campaign.landing_page.name}' is inactive."
            )

    @staticmethod
    def select_targets(
        campaign: Campaign,
        targeting: dict | None = None,
    ) -> list[Employee]:
        qs = Employee.objects.filter(
            organization=campaign.organization,
            is_active=True,
        )

        targeting = targeting or {}

        department = targeting.get("department") or campaign.department
        if department:
            qs = qs.filter(department__name__iexact=department)

        risk_level = targeting.get("risk_level")
        if risk_level:
            qs = qs.filter(risk_level=risk_level)

        employee_ids = targeting.get("employee_ids")
        if employee_ids:
            qs = qs.filter(id__in=employee_ids)

        already_assigned = CampaignAssignment.objects.filter(
            campaign=campaign,
        ).values_list("employee_id", flat=True)

        qs = qs.exclude(id__in=already_assigned)

        employees = list(qs)
        if not employees:
            raise CampaignLaunchError(
                "No eligible employees found for the given targeting criteria."
            )

        return employees

    @staticmethod
    def create_assignments(
        campaign: Campaign,
        employees: list[Employee],
    ) -> int:
        assignments = [
            CampaignAssignment(
                campaign=campaign,
                employee=emp,
            )
            for emp in employees
        ]
        CampaignAssignment.objects.bulk_create(assignments, ignore_conflicts=True)
        return len(assignments)

    @staticmethod
    def update_campaign_status(campaign: Campaign) -> None:
        now = timezone.now()
        campaign.status = CampaignStatus.ACTIVE
        campaign.launched_at = now
        campaign.save(update_fields=["status", "launched_at", "updated_at"])

    @staticmethod
    def launch(
        campaign: Campaign,
        user,
        targeting: dict | None = None,
        ip_address: str | None = None,
    ) -> dict:
        with transaction.atomic():
            CampaignService.validate_campaign(campaign)
            employees = CampaignService.select_targets(campaign, targeting)
            count = CampaignService.create_assignments(campaign, employees)
            CampaignService.update_campaign_status(campaign)

        try:
            CampaignActivity.objects.create(
                campaign=campaign,
                employee=None,
                activity_type="event",
                message=(
                    f"Campaign launched by {user.name} with {count} targets."
                ),
            )
        except Exception:
            logger.exception("Failed to create launch activity for campaign %s", campaign.id)

        try:
            AuditService.log(
                action="campaign.launch",
                resource_type="campaign",
                resource_id=str(campaign.id),
                actor=user,
                organization=campaign.organization,
                details=(
                    f"{user.name} launched campaign '{campaign.name}' "
                    f"targeting {count} employees."
                ),
                metadata={
                    "target_count": count,
                    "department": (targeting or {}).get("department") or campaign.department or None,
                    "risk_level": (targeting or {}).get("risk_level"),
                    "employee_ids": (targeting or {}).get("employee_ids"),
                    "scheduled_date": (
                        campaign.scheduled_date.isoformat()
                        if campaign.scheduled_date else None
                    ),
                },
                ip_address=ip_address,
            )
        except Exception:
            logger.exception("Failed to create audit log for campaign %s", campaign.id)

        try:
            NotificationService.notify_admins(
                organization=campaign.organization,
                exclude_user=user,
                title="Campaign Launched",
                message=(
                    f"'{campaign.name}' is now active — {count} employees targeted."
                ),
                severity="info",
                related_object_type="campaign",
                related_object_id=str(campaign.id),
            )
        except Exception:
            logger.exception(
                "Failed to create notifications for campaign %s", campaign.id
            )

        try:
            from apps.email.tasks import send_campaign_emails

            send_campaign_emails.delay(str(campaign.id))
        except Exception:
            logger.exception(
                "Failed to dispatch email tasks for campaign %s", campaign.id
            )

        return {"detail": "Campaign launched.", "target_count": count}
