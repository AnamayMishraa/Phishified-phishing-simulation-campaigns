from django.db import models

from django.contrib.auth import get_user_model

from apps.notifications.models import Notification

User = get_user_model()


class NotificationService:
    @staticmethod
    def notify_users(
        *,
        organization,
        user_ids: list,
        title: str,
        message: str,
        severity: str = "info",
        related_object_type: str = "",
        related_object_id: str = "",
    ) -> list[Notification]:
        notifications = [
            Notification(
                organization=organization,
                user_id=uid,
                title=title,
                message=message,
                severity=severity,
                related_object_type=related_object_type,
                related_object_id=related_object_id,
            )
            for uid in user_ids
        ]
        return Notification.objects.bulk_create(notifications)

    @staticmethod
    def notify_admins(
        *,
        organization,
        exclude_user=None,
        title: str,
        message: str,
        severity: str = "info",
        related_object_type: str = "",
        related_object_id: str = "",
    ) -> list[Notification]:
        qs = User.objects.filter(
            organization=organization,
            role="admin",
            is_active=True,
        ).filter(
            models.Q(notification_preferences__campaign_alerts=True)
            | models.Q(notification_preferences__isnull=True),
        )
        if exclude_user:
            qs = qs.exclude(pk=exclude_user.pk)

        notifications = [
            Notification(
                organization=organization,
                user=user,
                title=title,
                message=message,
                severity=severity,
                related_object_type=related_object_type,
                related_object_id=related_object_id,
            )
            for user in qs
        ]
        return Notification.objects.bulk_create(notifications)
