from django.db.models import Sum

from rest_framework import serializers

from apps.training.models import Course, CourseModule, TrainingEnrollment


class CourseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = [
            "id",
            "title",
            "description",
            "content_type",
            "duration_minutes",
            "order",
        ]


class CourseListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    difficulty_display = serializers.CharField(source="get_difficulty_level_display", read_only=True)
    total_modules = serializers.SerializerMethodField()
    total_duration_minutes = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()
    completed_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "description",
            "category",
            "category_display",
            "difficulty_level",
            "difficulty_display",
            "is_active",
            "total_modules",
            "total_duration_minutes",
            "enrollment_count",
            "completed_count",
            "created_at",
        ]

    def get_total_modules(self, obj):
        return obj.modules.count()

    def get_total_duration_minutes(self, obj):
        return obj.modules.aggregate(total=Sum("duration_minutes"))["total"] or 0

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

    def get_completed_count(self, obj):
        return obj.enrollments.filter(completed_at__isnull=False).count()


class CourseDetailSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    difficulty_display = serializers.CharField(source="get_difficulty_level_display", read_only=True)
    total_modules = serializers.SerializerMethodField()
    total_duration_minutes = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()
    completed_count = serializers.SerializerMethodField()
    modules = CourseModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "organization_id",
            "name",
            "description",
            "category",
            "category_display",
            "difficulty_level",
            "difficulty_display",
            "is_active",
            "total_modules",
            "total_duration_minutes",
            "enrollment_count",
            "completed_count",
            "modules",
            "created_at",
            "updated_at",
        ]

    def get_total_modules(self, obj):
        return obj.modules.count()

    def get_total_duration_minutes(self, obj):
        return obj.modules.aggregate(total=Sum("duration_minutes"))["total"] or 0

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

    def get_completed_count(self, obj):
        return obj.enrollments.filter(completed_at__isnull=False).count()


class TrainingEnrollmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    course_name = serializers.CharField(source="course.name", read_only=True)

    class Meta:
        model = TrainingEnrollment
        fields = [
            "id",
            "employee",
            "employee_name",
            "course",
            "course_name",
            "enrolled_at",
            "started_at",
            "completed_at",
            "score",
            "passed",
        ]
        read_only_fields = ["id", "enrolled_at"]

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"
