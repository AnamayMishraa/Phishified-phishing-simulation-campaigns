from rest_framework import serializers

from apps.reports.models import Report


class ReportListSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(
        source="generated_by.name", read_only=True, default=""
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "name",
            "description",
            "format",
            "file_size",
            "pages",
            "status",
            "generated_by_name",
            "generated_at",
        ]


class ReportDetailSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(
        source="generated_by.name", read_only=True, default=""
    )
    campaigns = serializers.JSONField(source="campaign_data", read_only=True)
    departments = serializers.JSONField(source="department_data", read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "organization_id",
            "name",
            "description",
            "format",
            "file_size",
            "pages",
            "status",
            "generated_by",
            "generated_by_name",
            "generated_at",
            "metrics",
            "campaigns",
            "departments",
        ]
        read_only_fields = [
            "id",
            "organization_id",
            "generated_at",
        ]
