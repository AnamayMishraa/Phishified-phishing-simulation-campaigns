from django.contrib import admin

from apps.training.models import Course, CourseModule, TrainingEnrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "difficulty_level", "is_active", "created_at"]
    list_filter = ["category", "difficulty_level", "is_active"]


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "content_type", "order", "duration_minutes"]
    list_filter = ["content_type", "course"]


@admin.register(TrainingEnrollment)
class TrainingEnrollmentAdmin(admin.ModelAdmin):
    list_display = ["employee", "course", "completed_at", "score", "passed"]
    list_filter = ["passed", "course"]
