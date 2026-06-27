from rest_framework import serializers


class KpiValueSerializer(serializers.Serializer):
    value = serializers.FloatField()
    change = serializers.FloatField(allow_null=True, default=None)


class KpisSerializer(serializers.Serializer):
    security_awareness_score = KpiValueSerializer()
    open_rate = KpiValueSerializer()
    click_rate = KpiValueSerializer()
    submission_rate = KpiValueSerializer()
    report_rate = KpiValueSerializer()
    avg_report_time_minutes = KpiValueSerializer()
    training_completion_pct = KpiValueSerializer()


class FunnelStageSerializer(serializers.Serializer):
    stage = serializers.CharField()
    count = serializers.IntegerField()


class HeatmapDeptSerializer(serializers.Serializer):
    department = serializers.CharField()
    low = serializers.IntegerField()
    medium = serializers.IntegerField()
    high = serializers.IntegerField()
    critical = serializers.IntegerField()
    total = serializers.IntegerField()
    avg_risk = serializers.FloatField()


class RiskTrendPointSerializer(serializers.Serializer):
    date = serializers.CharField()
    avg_risk = serializers.FloatField()


class DeptComparisonSerializer(serializers.Serializer):
    department = serializers.CharField()
    open_rate = serializers.FloatField()
    click_rate = serializers.FloatField()
    submission_rate = serializers.FloatField()
    report_rate = serializers.FloatField()
    sent = serializers.IntegerField()


class TrainingGroupSerializer(serializers.Serializer):
    employee_count = serializers.IntegerField()
    avg_risk_score = serializers.FloatField()
    click_rate = serializers.FloatField()


class TrainingImpactSerializer(serializers.Serializer):
    trained = TrainingGroupSerializer()
    untrained = TrainingGroupSerializer()
    risk_reduction = serializers.FloatField()


class RiskSegmentationSerializer(serializers.Serializer):
    low = serializers.IntegerField()
    medium = serializers.IntegerField()
    high = serializers.IntegerField()
    critical = serializers.IntegerField()


class RiskOverviewSerializer(serializers.Serializer):
    segmentation = RiskSegmentationSerializer()
    total_employees = serializers.IntegerField()


class VulnerableEmployeeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    department = serializers.CharField()
    risk_score = serializers.IntegerField()
    risk_level = serializers.CharField()
    total_phish_clicked = serializers.IntegerField()


class ImprovedEmployeeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    department = serializers.CharField()
    risk_score = serializers.IntegerField()
    previous_risk_score = serializers.IntegerField()
    improvement = serializers.IntegerField()


class FastestReporterSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    department = serializers.CharField()
    report_time_minutes = serializers.FloatField()
    campaign = serializers.CharField()


class HighRiskDeptSerializer(serializers.Serializer):
    department = serializers.CharField()
    avg_risk = serializers.FloatField()
    employee_count = serializers.IntegerField()
    high_risk_count = serializers.IntegerField()


class ExecutiveSummarySerializer(serializers.Serializer):
    awareness_score = serializers.FloatField()
    risk_assessment = serializers.CharField()
    findings = serializers.ListField(child=serializers.CharField())
    recommendations = serializers.ListField(child=serializers.CharField())
    generated_at = serializers.CharField()


class AllAnalyticsSerializer(serializers.Serializer):
    kpis = KpisSerializer()
    funnel = FunnelStageSerializer(many=True)
    heatmap = HeatmapDeptSerializer(many=True)
    risk_trend = RiskTrendPointSerializer(many=True)
    department_comparison = DeptComparisonSerializer(many=True)
    training_impact = TrainingImpactSerializer()
    risk_overview = RiskOverviewSerializer()
    most_vulnerable = VulnerableEmployeeSerializer(many=True)
    most_improved = ImprovedEmployeeSerializer(many=True)
    fastest_reporters = FastestReporterSerializer(many=True)
    highest_risk_departments = HighRiskDeptSerializer(many=True)
    executive_summary = ExecutiveSummarySerializer()
