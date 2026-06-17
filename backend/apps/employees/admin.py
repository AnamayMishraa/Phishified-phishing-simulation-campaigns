from django.contrib import admin

from apps.employees.models import Employee, EmployeeRiskSnapshot


class EmployeeRiskSnapshotInline(admin.TabularInline):
    model = EmployeeRiskSnapshot
    extra = 0
    fields = ["risk_score", "risk_level", "trigger_reason", "snapshot_date"]
    readonly_fields = ["risk_score", "risk_level", "snapshot_date", "created_at"]
    can_delete = False
    ordering = ["-snapshot_date"]
    max_num = 10


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        "email",
        "last_name",
        "first_name",
        "department",
        "risk_level",
        "risk_score",
        "is_active",
    ]
    list_filter = ["is_active", "risk_level", "organization", "department"]
    search_fields = ["first_name", "last_name", "email", "position"]
    list_select_related = ["department"]
    readonly_fields = ["id", "created_at", "updated_at"]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "id",
                    "organization",
                    "department",
                    "email",
                ]
            },
        ),
        (
            "Personal Info",
            {"fields": ["first_name", "last_name", "position", "hire_date"]},
        ),
        (
            "Risk Assessment",
            {"fields": ["risk_score", "risk_level"]},
        ),
        ("Status", {"fields": ["is_active"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]
    inlines = [EmployeeRiskSnapshotInline]


@admin.register(EmployeeRiskSnapshot)
class EmployeeRiskSnapshotAdmin(admin.ModelAdmin):
    list_display = [
        "employee",
        "risk_score",
        "risk_level",
        "trigger_reason",
        "snapshot_date",
        "created_at",
    ]
    list_filter = ["risk_level", "snapshot_date"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
        "employee__email",
        "trigger_reason",
    ]
    list_select_related = ["employee"]
    readonly_fields = ["id", "created_at"]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "id",
                    "employee",
                    "risk_score",
                    "risk_level",
                    "snapshot_date",
                ]
            },
        ),
        ("Details", {"fields": ["factors", "trigger_reason"]}),
        ("Timestamps", {"fields": ["created_at"]}),
    ]
