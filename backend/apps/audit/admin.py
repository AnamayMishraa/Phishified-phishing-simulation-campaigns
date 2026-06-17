from django.contrib import admin

from apps.audit.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [
        "action",
        "resource_type",
        "resource_id",
        "actor",
        "details_short",
        "created_at",
    ]
    list_filter = ["action", "resource_type", "organization"]
    search_fields = [
        "action",
        "resource_type",
        "resource_id",
        "actor__email",
        "details",
    ]
    list_select_related = ["actor"]
    readonly_fields = [
        "id",
        "organization",
        "actor",
        "action",
        "resource_type",
        "resource_id",
        "details",
        "metadata",
        "ip_address",
        "created_at",
    ]

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    @admin.display(description="Details")
    def details_short(self, obj):
        return obj.details[:80] if obj.details else ""
