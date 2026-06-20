import logging
from urllib.parse import urljoin

from django.conf import settings
from django.core.mail import send_mail

from apps.campaigns.models import CampaignAssignment
from apps.templates.models import EmailTemplate

logger = logging.getLogger(__name__)


class EmailRenderError(Exception):
    pass


class EmailSendError(Exception):
    pass


class EmailRenderer:
    PLACEHOLDER_PATTERNS = [
        "{{first_name}}",
        "{{last_name}}",
        "{{department}}",
        "{{email}}",
        "{{landing_page_url}}",
        "{{report_url}}",
    ]

    @staticmethod
    def _replace_personalization(text: str, assignment: CampaignAssignment) -> str:
        employee = assignment.employee
        dept_name = employee.department.name if employee.department else ""

        replacements = {
            "{{first_name}}": employee.first_name,
            "{{last_name}}": employee.last_name,
            "{{department}}": dept_name,
            "{{email}}": employee.email,
        }
        for placeholder, value in replacements.items():
            text = text.replace(placeholder, value)
        return text

    @staticmethod
    def _inject_tracking_links(text: str, assignment: CampaignAssignment) -> str:
        base = settings.PHISHIFIED_BASE_URL.rstrip("/")
        click_url = f"{base}/api/v1/track/click/{assignment.id}/"
        report_url = f"{base}/api/v1/track/report/{assignment.id}/"
        text = text.replace("{{landing_page_url}}", click_url)
        text = text.replace("{{report_url}}", report_url)
        return text

    @staticmethod
    def _inject_open_pixel(html: str, assignment: CampaignAssignment) -> str:
        base = settings.PHISHIFIED_BASE_URL.rstrip("/")
        open_url = f"{base}/api/v1/track/open/{assignment.id}/"
        pixel = f'<img src="{open_url}" width="1" height="1" style="display:none" alt="" />'
        if "</body>" in html.lower():
            html = html.replace("</body>", f"{pixel}</body>")
        elif "</html>" in html.lower():
            html = html.replace("</html>", f"{pixel}</html>")
        else:
            html += pixel
        return html

    @staticmethod
    def render(assignment: CampaignAssignment) -> tuple[str, str]:
        template: EmailTemplate = assignment.campaign.email_template
        if not template:
            raise EmailRenderError(
                f"Campaign {assignment.campaign_id} has no email template"
            )

        html_body = template.html_content or ""
        text_body = template.plain_text_content or ""

        html_body = EmailRenderer._replace_personalization(html_body, assignment)
        text_body = EmailRenderer._replace_personalization(text_body, assignment)

        html_body = EmailRenderer._inject_tracking_links(html_body, assignment)
        text_body = EmailRenderer._inject_tracking_links(text_body, assignment)

        html_body = EmailRenderer._inject_open_pixel(html_body, assignment)

        return html_body, text_body


class EmailSender:
    @staticmethod
    def send(
        assignment: CampaignAssignment,
        html_body: str,
        text_body: str,
    ) -> None:
        template: EmailTemplate = assignment.campaign.email_template
        employee = assignment.employee

        subject = template.subject or "No subject"
        subject = EmailRenderer._replace_personalization(subject, assignment)

        from_email = template.sender_email or settings.DEFAULT_FROM_EMAIL
        from_name = template.sender_name or ""

        if from_name:
            from_email = f"{from_name} <{from_email}>"

        try:
            send_mail(
                subject=subject,
                message=text_body,
                html_message=html_body,
                from_email=from_email,
                recipient_list=[employee.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.exception(
                "Failed to send email for assignment %s to %s",
                assignment.id,
                employee.email,
            )
            raise EmailSendError(str(e)) from e
