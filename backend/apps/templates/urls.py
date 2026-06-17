from django.urls import path

from apps.templates.views import TemplateViewSet

template_list = TemplateViewSet.as_view({"get": "list", "post": "create"})
template_detail = TemplateViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("", template_list, name="template-list"),
    path("<uuid:pk>/", template_detail, name="template-detail"),
]
