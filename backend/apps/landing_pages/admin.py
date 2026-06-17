from django.contrib import admin

from apps.landing_pages.models import LandingPage, LandingPageVisit


class LandingPageVisitInline(admin.TabularInline):
    model = LandingPageVisit
    extra = 0
    fields = ["employee", "ip_address", "submitted_credentials", "visited_at"]
    readonly_fields = ["visited_at", "submitted_at", "ip_address", "user_agent"]
    can_delete = False
    ordering = ["-visited_at"]
    max_num = 20


@admin.register(LandingPage)
class LandingPageAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "slug",
        "category",
        "difficulty_level",
        "is_active",
        "created_by",
        "created_at",
    ]
    list_filter = ["category", "difficulty_level", "is_active", "organization"]
    search_fields = ["name", "slug", "title"]
    list_select_related = ["created_by"]
    prepopulated_fields = {"slug": ["name"]}
    readonly_fields = ["id", "created_at", "updated_at"]
    fieldsets = [
        (None, {"fields": ["id", "organization", "name", "slug"]}),
        (
            "Content",
            {
                "fields": [
                    "category",
                    "title",
                    "html_content",
                    "css_content",
                ]
            },
        ),
        (
            "Classification",
            {"fields": ["difficulty_level"]},
        ),
        ("Status", {"fields": ["is_active", "created_by"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]
    inlines = [LandingPageVisitInline]


@admin.register(LandingPageVisit)
class LandingPageVisitAdmin(admin.ModelAdmin):
    list_display = [
        "landing_page",
        "employee",
        "ip_address",
        "submitted_credentials",
        "visited_at",
        "submitted_at",
    ]
    list_filter = ["submitted_credentials", "visited_at", "landing_page"]
    search_fields = [
        "landing_page__name",
        "ip_address",
        "employee__email",
    ]
    list_select_related = ["landing_page", "employee"]
    readonly_fields = ["id", "visited_at"]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "id",
                    "landing_page",
                    "employee",
                ]
            },
        ),
        (
            "Request",
            {"fields": ["ip_address", "user_agent"]},
        ),
        (
            "Credential Submission",
            {"fields": ["submitted_credentials", "submitted_at"]},
        ),
        ("Timestamps", {"fields": ["visited_at"]}),
    ]
