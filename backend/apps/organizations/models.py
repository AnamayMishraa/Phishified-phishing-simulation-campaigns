import uuid

from django.db import models


class EmailProvider(models.TextChoices):
    MICROSOFT_365 = "microsoft_365", "Microsoft 365"
    GOOGLE_WORKSPACE = "google_workspace", "Google Workspace"
    SENDGRID = "sendgrid", "SendGrid"
    SES = "ses", "Amazon SES"
    OTHER = "other", "Other"


class InfrastructureSetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.OneToOneField(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="infrastructure",
    )
    company_name = models.CharField(max_length=255, blank=True, default="")
    sender_name = models.CharField(max_length=255, blank=True, default="")
    sender_email = models.EmailField(blank=True, default="")
    landing_domain = models.CharField(max_length=255, blank=True, default="")
    landing_domain_verified = models.BooleanField(default=False)
    email_provider = models.CharField(
        max_length=20,
        choices=EmailProvider.choices,
        default=EmailProvider.OTHER,
    )
    smtp_host = models.CharField(max_length=255, blank=True, default="")
    smtp_port = models.PositiveIntegerField(default=587)
    smtp_username = models.CharField(max_length=255, blank=True, default="")
    smtp_password_enc = models.TextField(blank=True, default="")
    smtp_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "infrastructure setting"
        verbose_name_plural = "infrastructure settings"

    def __str__(self) -> str:
        return f"Infrastructure for {self.organization.name}"


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True)
    domain = models.CharField(max_length=255, blank=True, default="")
    is_active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "organization"
        verbose_name_plural = "organizations"

    def __str__(self) -> str:
        return self.name


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="departments",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "department"
        verbose_name_plural = "departments"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"],
                name="uq_department_org_name",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.organization.name})"
