from django.contrib import admin

from apps.templates.models import EmailTemplate


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "difficulty_level",
        "sender_email",
        "is_active",
        "created_by",
        "created_at",
    ]
    list_filter = ["category", "difficulty_level", "is_active", "organization"]
    search_fields = ["name", "subject", "sender_name", "sender_email"]
    list_select_related = ["created_by"]
    readonly_fields = ["id", "created_at", "updated_at"]
    fieldsets = [
        (None, {"fields": ["id", "organization", "name", "category"]}),
        (
            "Email Content",
            {
                "fields": [
                    "subject",
                    "sender_name",
                    "sender_email",
                    "html_content",
                    "plain_text_content",
                ]
            },
        ),
        (
            "Classification",
            {"fields": ["difficulty_level", "tags"]},
        ),
        ("Status", {"fields": ["is_active", "created_by"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]
