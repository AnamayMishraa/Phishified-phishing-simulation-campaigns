from django.utils import timezone

from apps.audit.models import AuditLog


class AuditService:
    @staticmethod
    def log(
        *,
        action: str,
        resource_type: str,
        resource_id: str,
        actor,
        organization,
        details: str = "",
        metadata: dict | None = None,
        ip_address: str | None = None,
    ) -> AuditLog:
        return AuditLog.objects.create(
            organization=organization,
            actor=actor,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            metadata=metadata or {},
            ip_address=ip_address,
        )
