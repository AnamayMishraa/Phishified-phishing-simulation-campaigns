import uuid

from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="audit_logs",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=100, db_index=True)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=255, blank=True, default="")
    details = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "audit log"
        verbose_name_plural = "audit logs"
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
            models.Index(fields=["organization", "action"]),
            models.Index(fields=["organization", "resource_type", "resource_id"]),
            models.Index(fields=["actor", "-created_at"]),
        ]
        default_permissions = ("add", "change", "delete", "view")

    def __str__(self) -> str:
        return f"{self.action} on {self.resource_type}#{self.resource_id}"

    def save(self, *args, **kwargs):
        if self.pk:
            raise RuntimeError("AuditLog records are immutable and cannot be updated.")
        super().save(*args, **kwargs)

    @classmethod
    def from_db(cls, db, field_names, values):
        instance = super().from_db(db, field_names, values)
        instance._original_values = dict(zip(field_names, values))
        return instance

    def refresh_from_db(self, *args, **kwargs):
        raise RuntimeError("AuditLog records cannot be refreshed.")

    def delete(self, *args, **kwargs):
        raise RuntimeError("AuditLog records are immutable and cannot be deleted.")
