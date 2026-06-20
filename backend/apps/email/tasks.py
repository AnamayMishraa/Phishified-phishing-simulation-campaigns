import logging

from celery import shared_task
from django.db.models import F
from django.utils import timezone

from apps.campaigns.models import Campaign, CampaignAssignment
from apps.email.services import EmailRenderer, EmailSender

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_single_email(self, assignment_id: str) -> None:
    try:
        assignment = (
            CampaignAssignment.objects.select_related(
                "campaign__email_template",
                "employee__department",
            )
            .get(id=assignment_id)
        )
    except CampaignAssignment.DoesNotExist:
        logger.warning("Assignment %s not found, skipping", assignment_id)
        return

    if assignment.sent_at:
        logger.info("Assignment %s already sent at %s", assignment_id, assignment.sent_at)
        return

    try:
        html_body, text_body = EmailRenderer.render(assignment)
        EmailSender.send(assignment, html_body, text_body)
    except Exception as exc:
        logger.exception(
            "Failed to deliver assignment %s (attempt %s/3)",
            assignment_id,
            self.request.retries + 1,
        )
        raise self.retry(exc=exc)

    now = timezone.now()
    assignment.sent_at = now
    assignment.save(update_fields=["sent_at"])

    Campaign.objects.filter(id=assignment.campaign_id).update(
        sent_count=F("sent_count") + 1
    )

    logger.info(
        "Delivered assignment %s for %s",
        assignment_id,
        assignment.employee.email,
    )


@shared_task
def send_campaign_emails(campaign_id: str) -> dict:
    try:
        campaign = Campaign.objects.only("id", "name").get(id=campaign_id)
    except Campaign.DoesNotExist:
        logger.warning("Campaign %s not found, skipping", campaign_id)
        return {"campaign_id": campaign_id, "dispatched": 0}

    assignments = CampaignAssignment.objects.filter(
        campaign=campaign,
        sent_at__isnull=True,
    ).values_list("id", flat=True)

    assignment_ids = list(assignments)
    for aid in assignment_ids:
        send_single_email.delay(str(aid))

    logger.info(
        "Dispatched %d email tasks for campaign %s",
        len(assignment_ids),
        campaign_id,
    )

    return {
        "campaign_id": campaign_id,
        "dispatched": len(assignment_ids),
    }
