from django.contrib import admin

from apps.campaigns.models import Campaign, CampaignAssignment, CampaignActivity


class CampaignAssignmentInline(admin.TabularInline):
    model = CampaignAssignment
    extra = 0
    fields = [
        "employee",
        "funnel_step_display",
        "sent_at",
        "opened_at",
        "clicked_at",
        "submitted_at",
        "reported_at",
    ]
    readonly_fields = [
        "funnel_step_display",
        "sent_at",
        "opened_at",
        "clicked_at",
        "submitted_at",
        "reported_at",
        "created_at",
    ]
    can_delete = False
    ordering = ["-created_at"]
    autocomplete_fields = ["employee"]

    @admin.display(description="Funnel Step")
    def funnel_step_display(self, obj):
        return obj.funnel_step


class CampaignActivityInline(admin.TabularInline):
    model = CampaignActivity
    extra = 0
    fields = ["activity_type", "message", "employee", "timestamp"]
    readonly_fields = ["timestamp"]
    can_delete = False
    ordering = ["-timestamp"]
    max_num = 20
    autocomplete_fields = ["employee"]


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "type",
        "status_badge",
        "department",
        "sent_count",
        "click_rate_display",
        "report_rate_display",
        "created_at",
    ]
    list_filter = ["status", "type", "organization"]
    search_fields = ["name", "description"]
    list_select_related = ["email_template", "landing_page", "created_by"]
    readonly_fields = [
        "id",
        "sent_count",
        "open_count",
        "click_count",
        "submission_count",
        "report_count",
        "bounce_count",
        "open_rate",
        "click_rate",
        "submission_rate",
        "report_rate",
        "created_at",
        "updated_at",
    ]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "id",
                    "organization",
                    "name",
                    "type",
                    "status",
                ]
            },
        ),
        (
            "Content",
            {
                "fields": [
                    "description",
                    "department",
                    "email_template",
                    "landing_page",
                ]
            },
        ),
        (
            "Schedule",
            {"fields": ["scheduled_date", "completed_date"]},
        ),
        (
            "Analytics",
            {
                "fields": [
                    ("sent_count", "open_count", "click_count"),
                    ("submission_count", "report_count", "bounce_count"),
                    ("open_rate", "click_rate"),
                    ("submission_rate", "report_rate"),
                ]
            },
        ),
        ("Attribution", {"fields": ["created_by"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]
    inlines = [CampaignAssignmentInline, CampaignActivityInline]

    @admin.display(description="Status")
    def status_badge(self, obj):
        colors = {
            "draft": "var(--text-muted)",
            "active": "var(--status-success)",
            "paused": "var(--status-warning)",
            "completed": "var(--accent-blue-light)",
        }
        color = colors.get(obj.status, "inherit")
        return f'<span style="color: {color}; font-weight: 600;">{obj.get_status_display()}</span>'

    status_badge.allow_tags = True

    @admin.display(description="Click Rate")
    def click_rate_display(self, obj):
        return f"{obj.click_rate:.1%}"

    @admin.display(description="Report Rate")
    def report_rate_display(self, obj):
        return f"{obj.report_rate:.1%}"


@admin.register(CampaignAssignment)
class CampaignAssignmentAdmin(admin.ModelAdmin):
    list_display = [
        "campaign",
        "employee",
        "funnel_step",
        "sent_at",
        "opened_at",
        "clicked_at",
        "submitted_at",
        "reported_at",
    ]
    list_filter = ["campaign"]
    search_fields = [
        "campaign__name",
        "employee__email",
        "employee__first_name",
        "employee__last_name",
    ]
    list_select_related = ["campaign", "employee"]
    autocomplete_fields = ["campaign", "employee"]
    readonly_fields = [
        "id",
        "funnel_step",
        "sent_at",
        "opened_at",
        "clicked_at",
        "submitted_at",
        "reported_at",
        "created_at",
    ]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "id",
                    "campaign",
                    "employee",
                    "funnel_step",
                ]
            },
        ),
        (
            "Funnel Timestamps",
            {
                "fields": [
                    "sent_at",
                    "opened_at",
                    "clicked_at",
                    "submitted_at",
                    "reported_at",
                ]
            },
        ),
        ("Timestamps", {"fields": ["created_at"]}),
    ]


@admin.register(CampaignActivity)
class CampaignActivityAdmin(admin.ModelAdmin):
    list_display = [
        "campaign",
        "activity_type",
        "message_short",
        "employee",
        "timestamp",
    ]
    list_filter = ["activity_type", "campaign"]
    search_fields = [
        "message",
        "campaign__name",
        "employee__email",
    ]
    list_select_related = ["campaign", "employee"]
    autocomplete_fields = ["campaign", "employee"]
    readonly_fields = ["id", "timestamp"]

    @admin.display(description="Message")
    def message_short(self, obj):
        return obj.message[:80]
