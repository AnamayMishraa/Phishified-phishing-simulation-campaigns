import uuid

from django.conf import settings
from django.db import models


class ReportStatus(models.TextChoices):
    GENERATED = "Generated", "Generated"
    ARCHIVED = "Archived", "Archived"
    GENERATING = "Generating", "Generating"


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="reports",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    format = models.CharField(max_length=10, default="PDF")
    file_size = models.CharField(max_length=20, blank=True, default="")
    pages = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=15,
        choices=ReportStatus.choices,
        default=ReportStatus.GENERATED,
    )
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="generated_reports",
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    metrics = models.JSONField(default=dict, blank=True)
    campaign_data = models.JSONField(default=list, blank=True)
    department_data = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["-generated_at"]
        verbose_name = "report"
        verbose_name_plural = "reports"
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "-generated_at"]),
        ]

    def __str__(self) -> str:
        return self.name
