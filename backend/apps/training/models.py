import uuid

from django.conf import settings
from django.db import models


class CourseCategory(models.TextChoices):
    PHISHING_AWARENESS = "phishing_awareness", "Phishing Awareness"
    SECURITY_BASICS = "security_basics", "Security Basics"
    SOCIAL_ENGINEERING = "social_engineering", "Social Engineering"
    DATA_PROTECTION = "data_protection", "Data Protection"


class DifficultyLevel(models.TextChoices):
    BEGINNER = "beginner", "Beginner"
    INTERMEDIATE = "intermediate", "Intermediate"
    ADVANCED = "advanced", "Advanced"


class ModuleContentType(models.TextChoices):
    VIDEO = "video", "Video"
    ARTICLE = "article", "Article"
    QUIZ = "quiz", "Quiz"
    INTERACTIVE = "interactive", "Interactive"


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="courses",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    category = models.CharField(
        max_length=25,
        choices=CourseCategory.choices,
        default=CourseCategory.PHISHING_AWARENESS,
    )
    difficulty_level = models.CharField(
        max_length=15,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.BEGINNER,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "course"
        verbose_name_plural = "courses"
        indexes = [
            models.Index(fields=["organization", "category"]),
            models.Index(fields=["organization", "is_active"]),
        ]

    def __str__(self) -> str:
        return self.name


class CourseModule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="modules",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    content_type = models.CharField(
        max_length=15,
        choices=ModuleContentType.choices,
        default=ModuleContentType.ARTICLE,
    )
    content_url = models.URLField(blank=True, default="")
    content_body = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=5)

    class Meta:
        ordering = ["course", "order"]
        verbose_name = "course module"
        verbose_name_plural = "course modules"
        indexes = [
            models.Index(fields=["course", "order"]),
        ]

    def __str__(self) -> str:
        return f"{self.course.name} / {self.title}"


class TrainingEnrollment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="training_enrollments",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveSmallIntegerField(null=True, blank=True)
    passed = models.BooleanField(null=True)

    class Meta:
        ordering = ["-enrolled_at"]
        verbose_name = "training enrollment"
        verbose_name_plural = "training enrollments"
        indexes = [
            models.Index(fields=["employee", "course"]),
            models.Index(fields=["course", "completed_at"]),
            models.Index(fields=["employee", "completed_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "course"],
                name="uq_enrollment_employee_course",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.employee} -> {self.course.name}"
