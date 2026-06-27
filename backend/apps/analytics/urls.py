from django.urls import path

from apps.analytics.views import (
    AnalyticsFiltersView,
    AnalyticsKpiView,
    CampaignFunnelView,
    DepartmentComparisonView,
    DepartmentHeatmapView,
    ExecutiveAnalyticsView,
    ExecutiveSummaryView,
    ExportAnalyticsCsvView,
    ExportCampaignPerformanceCsvView,
    ExportEmployeeRiskCsvView,
    ExportPdfView,
    RiskTrendView,
    TrainingImpactView,
)

urlpatterns = [
    path("executive/", ExecutiveAnalyticsView.as_view(), name="analytics-executive"),
    path("kpis/", AnalyticsKpiView.as_view(), name="analytics-kpis"),
    path("funnel/", CampaignFunnelView.as_view(), name="analytics-funnel"),
    path("heatmap/", DepartmentHeatmapView.as_view(), name="analytics-heatmap"),
    path("risk-trend/", RiskTrendView.as_view(), name="analytics-risk-trend"),
    path("department-comparison/", DepartmentComparisonView.as_view(), name="analytics-dept-comparison"),
    path("training-impact/", TrainingImpactView.as_view(), name="analytics-training-impact"),
    path("executive-summary/", ExecutiveSummaryView.as_view(), name="analytics-exec-summary"),
    path("filters/", AnalyticsFiltersView.as_view(), name="analytics-filters"),
    path("export/employee-risk-csv/", ExportEmployeeRiskCsvView.as_view(), name="analytics-export-employee-csv"),
    path("export/campaign-performance-csv/", ExportCampaignPerformanceCsvView.as_view(), name="analytics-export-campaign-csv"),
    path("export/analytics-csv/", ExportAnalyticsCsvView.as_view(), name="analytics-export-analytics-csv"),
    path("export/pdf/", ExportPdfView.as_view(), name="analytics-export-pdf"),
]
