from rest_framework import serializers

from apps.employees.models import Employee, EmployeeRiskSnapshot


class EmployeeRiskSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeRiskSnapshot
        fields = [
            "id",
            "risk_score",
            "risk_level",
            "factors",
            "trigger_reason",
            "snapshot_date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source="department.name", read_only=True, default=""
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "department_name",
            "position",
            "risk_score",
            "risk_level",
            "is_active",
            "created_at",
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department_id = serializers.UUIDField(
        source="department.id", read_only=True, allow_null=True
    )
    department_name = serializers.CharField(
        source="department.name", read_only=True, default=""
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "organization_id",
            "department_id",
            "department_name",
            "first_name",
            "last_name",
            "email",
            "position",
            "hire_date",
            "risk_score",
            "risk_level",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization_id", "created_at", "updated_at"]


class EmployeeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            "id",
            "department",
            "first_name",
            "last_name",
            "email",
            "position",
            "hire_date",
            "risk_score",
            "risk_level",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        qs = Employee.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "An employee with this email already exists."
            )
        return value
