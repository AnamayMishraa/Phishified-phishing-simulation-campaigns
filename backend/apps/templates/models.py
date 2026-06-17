import uuid

from django.conf import settings
from django.db import models


class TemplateCategory(models.TextChoices):
    CREDENTIAL_HARVESTING = "credential_harvesting", "Credential Harvesting"
    LINK_CLICK = "link_click", "Link Click"
    ATTACHMENT = "attachment", "Attachment"


class DifficultyLevel(models.TextChoices):
    EASY = "easy", "Easy"
    MEDIUM = "medium", "Medium"
    HARD = "hard", "Hard"


class EmailTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="email_templates",
    )
    name = models.CharField(max_length=255)
    category = models.CharField(
        max_length=25,
        choices=TemplateCategory.choices,
    )
    subject = models.CharField(max_length=512)
    sender_name = models.CharField(max_length=255, blank=True, default="")
    sender_email = models.EmailField(blank=True, default="")
    html_content = models.TextField(blank=True, default="")
    plain_text_content = models.TextField(blank=True, default="")
    difficulty_level = models.CharField(
        max_length=10,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.MEDIUM,
    )
    tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_templates",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "email template"
        verbose_name_plural = "email templates"
        indexes = [
            models.Index(fields=["organization", "category"]),
            models.Index(fields=["organization", "difficulty_level"]),
            models.Index(fields=["organization", "is_active"]),
        ]

    def __str__(self) -> str:
        return self.name
