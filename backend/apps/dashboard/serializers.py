from rest_framework import serializers


class KpiChangeSerializer(serializers.Serializer):
    value = serializers.CharField()
    trend = serializers.ChoiceField(["up", "down", "neutral"])
    label = serializers.CharField()


class KpiMetricSerializer(serializers.Serializer):
    value = serializers.IntegerField()
    change = KpiChangeSerializer()


class ClickRateKpiSerializer(serializers.Serializer):
    value = serializers.FloatField()
    change = KpiChangeSerializer()


class MonthlyPerformanceSerializer(serializers.Serializer):
    month = serializers.CharField()
    click_rate = serializers.FloatField()
    report_rate = serializers.FloatField()


class DepartmentRiskSerializer(serializers.Serializer):
    name = serializers.CharField()
    risk = serializers.FloatField()
    employee_count = serializers.IntegerField()


class RecentActivitySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    type = serializers.CharField()
    message = serializers.CharField()
    department = serializers.CharField()
    timestamp = serializers.DateTimeField()


class HighRiskEmployeeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    department = serializers.CharField()
    total_phish_clicked = serializers.IntegerField()
    risk_score = serializers.IntegerField()


class MostImprovedEmployeeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    department = serializers.CharField()
    risk_score = serializers.IntegerField()
    previous_risk_score = serializers.IntegerField()
    improvement = serializers.IntegerField()


class HighestReportingEmployeeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    department = serializers.CharField()
    total_reported = serializers.IntegerField()
    risk_score = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    kpis = serializers.DictField(child=serializers.DictField())
    campaign_performance = MonthlyPerformanceSerializer(many=True)
    department_risk = DepartmentRiskSerializer(many=True)
    recent_activities = RecentActivitySerializer(many=True)
    high_risk_employees = HighRiskEmployeeSerializer(many=True)
    most_improved_employees = MostImprovedEmployeeSerializer(many=True)
    highest_reporting_employees = HighestReportingEmployeeSerializer(many=True)
