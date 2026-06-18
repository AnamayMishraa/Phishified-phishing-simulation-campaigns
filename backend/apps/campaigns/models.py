import uuid

from django.conf import settings
from django.db import models


class CampaignType(models.TextChoices):
    EMAIL = "email", "Email"
    SMS = "sms", "SMS"
    VOICE = "voice", "Voice"
    QR_CODE = "qr_code", "QR Code"


class CampaignStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    ACTIVE = "active", "Active"
    PAUSED = "paused", "Paused"
    COMPLETED = "completed", "Completed"


class Campaign(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="campaigns",
    )
    name = models.CharField(max_length=255)
    type = models.CharField(
        max_length=10,
        choices=CampaignType.choices,
        default=CampaignType.EMAIL,
    )
    status = models.CharField(
        max_length=12,
        choices=CampaignStatus.choices,
        default=CampaignStatus.DRAFT,
    )
    description = models.TextField(blank=True, default="")
    department = models.CharField(max_length=100, blank=True, default="")
    email_template = models.ForeignKey(
        "templates.EmailTemplate",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="campaigns",
    )
    landing_page = models.ForeignKey(
        "landing_pages.LandingPage",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="campaigns",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_campaigns",
    )
    scheduled_date = models.DateTimeField(null=True, blank=True)
    launched_at = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    sent_count = models.PositiveIntegerField(default=0)
    open_count = models.PositiveIntegerField(default=0)
    click_count = models.PositiveIntegerField(default=0)
    submission_count = models.PositiveIntegerField(default=0)
    report_count = models.PositiveIntegerField(default=0)
    bounce_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "campaign"
        verbose_name_plural = "campaigns"
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "-created_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"],
                name="uq_campaign_org_name",
            ),
        ]

    def __str__(self) -> str:
        return self.name

    @property
    def open_rate(self) -> float:
        if self.sent_count:
            return self.open_count / self.sent_count
        return 0.0

    @property
    def click_rate(self) -> float:
        if self.sent_count:
            return self.click_count / self.sent_count
        return 0.0

    @property
    def submission_rate(self) -> float:
        if self.sent_count:
            return self.submission_count / self.sent_count
        return 0.0

    @property
    def report_rate(self) -> float:
        if self.sent_count:
            return self.report_count / self.sent_count
        return 0.0


class CampaignAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="campaign_assignments",
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reported_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "campaign assignment"
        verbose_name_plural = "campaign assignments"
        indexes = [
            models.Index(fields=["campaign", "employee"]),
            models.Index(fields=["employee", "campaign"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["campaign", "employee"],
                name="uq_assignment_campaign_employee",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.employee} -> {self.campaign}"

    @property
    def funnel_step(self) -> str:
        if self.reported_at:
            return "reported"
        if self.submitted_at:
            return "submitted"
        if self.clicked_at:
            return "clicked"
        if self.opened_at:
            return "opened"
        if self.sent_at:
            return "sent"
        return "pending"


class ActivityType(models.TextChoices):
    SENT = "sent", "Sent"
    OPENED = "opened", "Opened"
    CLICKED = "clicked", "Clicked"
    SUBMITTED = "submitted", "Submitted"
    REPORTED = "reported", "Reported"
    EVENT = "event", "Event"


class CampaignActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="activities",
    )
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="campaign_activities",
    )
    activity_type = models.CharField(
        max_length=12,
        choices=ActivityType.choices,
    )
    message = models.TextField()
    metadata = models.JSONField(null=True, blank=True, default=None)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "campaign activity"
        verbose_name_plural = "campaign activities"
        indexes = [
            models.Index(fields=["campaign", "-timestamp"]),
            models.Index(fields=["employee", "-timestamp"]),
        ]

    def __str__(self) -> str:
        return f"[{self.activity_type}] {self.message[:60]}"
