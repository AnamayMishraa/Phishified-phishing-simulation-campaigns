from django.urls import path

from apps.employees.views import EmployeeViewSet, EmployeeRiskSnapshotViewSet

employee_list = EmployeeViewSet.as_view({"get": "list", "post": "create"})
employee_detail = EmployeeViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)
snapshot_list = EmployeeRiskSnapshotViewSet.as_view({"get": "list"})

urlpatterns = [
    path("", employee_list, name="employee-list"),
    path("<uuid:pk>/", employee_detail, name="employee-detail"),
    path(
        "<uuid:employee_pk>/risk-snapshots/",
        snapshot_list,
        name="employee-risk-snapshots",
    ),
]
