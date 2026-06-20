import logging

from django.conf import settings
from django.core.mail import get_connection, send_mail

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
        "{{tracking_url}}",
    ]

    @staticmethod
    def _get_tracking_base(assignment: CampaignAssignment) -> str:
        org = assignment.campaign.organization
        try:
            infra = org.infrastructure
            if infra.landing_domain:
                return f"https://{infra.landing_domain}"
        except Exception:
            pass
        return settings.PHISHIFIED_BASE_URL.rstrip("/")

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
        base = EmailRenderer._get_tracking_base(assignment)
        click_url = f"{base}/api/v1/track/click/{assignment.id}/"
        report_url = f"{base}/api/v1/track/report/{assignment.id}/"
        text = text.replace("{{landing_page_url}}", click_url)
        text = text.replace("{{report_url}}", report_url)
        text = text.replace("{{tracking_url}}", click_url)
        return text

    @staticmethod
    def _inject_open_pixel(html: str, assignment: CampaignAssignment) -> str:
        base = EmailRenderer._get_tracking_base(assignment)
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
    def _get_org_from_email(assignment: CampaignAssignment) -> str:
        org = assignment.campaign.organization
        try:
            infra = org.infrastructure
            sender_email = infra.sender_email or ""
            from_name = infra.sender_name or ""
            if from_name and sender_email:
                return f"{from_name} <{sender_email}>"
            if sender_email:
                return sender_email
        except Exception:
            pass
        return ""

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

        from_email = EmailSender._get_org_from_email(assignment)
        if not from_email:
            from_email = template.sender_email or settings.DEFAULT_FROM_EMAIL
            from_name = template.sender_name or ""
            if from_name:
                from_email = f"{from_name} <{from_email}>"

        connection = None
        try:
            org = assignment.campaign.organization
            infra = org.infrastructure
            if infra.smtp_host:
                conn_kwargs = {
                    "backend": "django.core.mail.backends.smtp.EmailBackend",
                    "host": infra.smtp_host,
                    "port": infra.smtp_port,
                    "fail_silently": False,
                }
                if infra.smtp_username and infra.smtp_password_enc:
                    from apps.organizations.crypto import decrypt_value
                    conn_kwargs["username"] = infra.smtp_username
                    conn_kwargs["password"] = decrypt_value(infra.smtp_password_enc)
                if infra.smtp_port == 587:
                    conn_kwargs["use_tls"] = True
                elif infra.smtp_port == 465:
                    conn_kwargs["use_ssl"] = True
                connection = get_connection(**conn_kwargs)
        except Exception:
            logger.warning("Failed to configure org SMTP, falling back to default")

        try:
            send_mail(
                subject=subject,
                message=text_body,
                html_message=html_body,
                from_email=from_email,
                recipient_list=[employee.email],
                connection=connection,
                fail_silently=False,
            )
        except Exception as e:
            logger.exception(
                "Failed to send email for assignment %s to %s",
                assignment.id,
                employee.email,
            )
            raise EmailSendError(str(e)) from e
