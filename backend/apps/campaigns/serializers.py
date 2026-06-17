from rest_framework import serializers

from apps.campaigns.models import Campaign, CampaignActivity, CampaignAssignment


class CampaignAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    funnel_step = serializers.CharField(read_only=True)

    class Meta:
        model = CampaignAssignment
        fields = [
            "id",
            "employee",
            "employee_name",
            "funnel_step",
            "sent_at",
            "opened_at",
            "clicked_at",
            "submitted_at",
            "reported_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "funnel_step",
            "sent_at",
            "opened_at",
            "clicked_at",
            "submitted_at",
            "reported_at",
            "created_at",
        ]

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class CampaignActivitySerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = CampaignActivity
        fields = [
            "id",
            "activity_type",
            "message",
            "employee",
            "employee_name",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]

    def get_employee_name(self, obj):
        if obj.employee:
            return f"{obj.employee.first_name} {obj.employee.last_name}"
        return ""


class CampaignListSerializer(serializers.ModelSerializer):
    type = serializers.CharField()
    status = serializers.CharField()
    open_rate = serializers.FloatField(read_only=True)
    click_rate = serializers.FloatField(read_only=True)

    class Meta:
        model = Campaign
        fields = [
            "id",
            "name",
            "type",
            "status",
            "department",
            "sent_count",
            "open_count",
            "click_count",
            "submission_count",
            "report_count",
            "open_rate",
            "click_rate",
            "created_at",
        ]


class CampaignDetailSerializer(serializers.ModelSerializer):
    type = serializers.CharField()
    status = serializers.CharField()
    open_rate = serializers.FloatField(read_only=True)
    click_rate = serializers.FloatField(read_only=True)
    submission_rate = serializers.FloatField(read_only=True)
    report_rate = serializers.FloatField(read_only=True)
    template_name = serializers.CharField(
        source="email_template.name", read_only=True, default=None
    )
    created_by_name = serializers.CharField(
        source="created_by.name", read_only=True, default=""
    )

    class Meta:
        model = Campaign
        fields = [
            "id",
            "organization_id",
            "name",
            "type",
            "status",
            "description",
            "department",
            "email_template",
            "template_name",
            "landing_page",
            "created_by",
            "created_by_name",
            "scheduled_date",
            "completed_date",
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
        read_only_fields = [
            "id",
            "organization_id",
            "sent_count",
            "open_count",
            "click_count",
            "submission_count",
            "report_count",
            "bounce_count",
            "created_at",
            "updated_at",
        ]


class CampaignWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = [
            "id",
            "name",
            "type",
            "description",
            "department",
            "email_template",
            "landing_page",
            "scheduled_date",
        ]
        read_only_fields = ["id"]

    def validate_email_template(self, value):
        if value and value.organization_id != self.context["request"].user.organization_id:
            raise serializers.ValidationError("Template does not belong to your organization.")
        return value

    def validate_landing_page(self, value):
        if value and value.organization_id != self.context["request"].user.organization_id:
            raise serializers.ValidationError("Landing page does not belong to your organization.")
        return value
