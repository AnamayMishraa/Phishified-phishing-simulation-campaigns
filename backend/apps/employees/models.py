import uuid

from django.db import models


class RiskLevel(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    CRITICAL = "critical", "Critical"


class Employee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="employees",
    )
    department = models.ForeignKey(
        "organizations.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    position = models.CharField(max_length=255, blank=True, default="")
    hire_date = models.DateField(null=True, blank=True)
    risk_score = models.PositiveSmallIntegerField(default=0)
    risk_level = models.CharField(
        max_length=10,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]
        verbose_name = "employee"
        verbose_name_plural = "employees"
        indexes = [
            models.Index(fields=["organization", "risk_level"]),
            models.Index(fields=["organization", "department"]),
            models.Index(fields=["email"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "email"],
                name="uq_employee_org_email",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} <{self.email}>"


class EmployeeRiskSnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="risk_snapshots",
    )
    risk_score = models.PositiveSmallIntegerField()
    risk_level = models.CharField(max_length=10, choices=RiskLevel.choices)
    factors = models.JSONField(default=dict, blank=True)
    trigger_reason = models.CharField(max_length=255, blank=True, default="")
    snapshot_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-snapshot_date", "-created_at"]
        verbose_name = "employee risk snapshot"
        verbose_name_plural = "employee risk snapshots"
        indexes = [
            models.Index(fields=["employee", "-snapshot_date"]),
            models.Index(fields=["snapshot_date"]),
        ]

    def __str__(self) -> str:
        return (
            f"{self.employee} — {self.risk_level} ({self.risk_score}) "
            f"on {self.snapshot_date}"
        )
