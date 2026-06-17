import uuid

from django.conf import settings
from django.db import models


class LandingPageCategory(models.TextChoices):
    AUTH_PORTAL = "auth_portal", "Auth Portal"
    CORPORATE_PAGE = "corporate_page", "Corporate Page"
    LANDING_PAGE = "landing_page", "Landing Page"


class DifficultyLevel(models.TextChoices):
    EASY = "easy", "Easy"
    MEDIUM = "medium", "Medium"
    HARD = "hard", "Hard"


class LandingPage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="landing_pages",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=200)
    category = models.CharField(
        max_length=20,
        choices=LandingPageCategory.choices,
        default=LandingPageCategory.LANDING_PAGE,
    )
    title = models.CharField(max_length=512, blank=True, default="")
    html_content = models.TextField(blank=True, default="")
    css_content = models.TextField(blank=True, default="")
    difficulty_level = models.CharField(
        max_length=10,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.MEDIUM,
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_landing_pages",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "landing page"
        verbose_name_plural = "landing pages"
        indexes = [
            models.Index(fields=["organization", "category"]),
            models.Index(fields=["organization", "is_active"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "slug"],
                name="uq_landingpage_org_slug",
            ),
        ]

    def __str__(self) -> str:
        return self.name


class LandingPageVisit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    landing_page = models.ForeignKey(
        LandingPage,
        on_delete=models.CASCADE,
        related_name="visits",
    )
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="landing_page_visits",
    )
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, default="")
    visited_at = models.DateTimeField(auto_now_add=True)
    submitted_credentials = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-visited_at"]
        verbose_name = "landing page visit"
        verbose_name_plural = "landing page visits"
        indexes = [
            models.Index(fields=["landing_page", "-visited_at"]),
            models.Index(fields=["landing_page", "submitted_credentials"]),
        ]

    def __str__(self) -> str:
        return (
            f"Visit to {self.landing_page.name} "
            f"at {self.visited_at.isoformat() if self.visited_at else '?'}"
        )
