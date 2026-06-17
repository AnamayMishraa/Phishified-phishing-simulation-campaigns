from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "name", "organization", "role", "is_active"]
    list_filter = ["role", "is_active", "organization"]
    search_fields = ["email", "name"]
    ordering = ["email"]
    fieldsets = [
        (None, {"fields": ["id", "email", "password"]}),
        ("Personal info", {"fields": ["name"]}),
        ("Organization", {"fields": ["organization", "role"]}),
        ("Preferences", {"fields": ["preferences"]}),
        ("Important dates", {"fields": ["last_login", "created_at", "updated_at"]}),
    ]
    readonly_fields = ["id", "created_at", "updated_at"]
    add_fieldsets = [
        (
            None,
            {
                "classes": ["wide"],
                "fields": ["email", "name", "organization", "role", "password1", "password2"],
            },
        ),
    ]
