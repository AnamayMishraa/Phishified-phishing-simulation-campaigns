from django.urls import path

from apps.training.views import CourseViewSet, EnrollmentViewSet

course_list = CourseViewSet.as_view({"get": "list"})
course_detail = CourseViewSet.as_view({"get": "retrieve"})

enrollment_list = EnrollmentViewSet.as_view({"get": "list", "post": "create"})
enrollment_detail = EnrollmentViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)
enrollment_complete = EnrollmentViewSet.as_view({"post": "complete"})

urlpatterns = [
    path("courses/", course_list, name="course-list"),
    path("courses/<uuid:pk>/", course_detail, name="course-detail"),
    path("enrollments/", enrollment_list, name="enrollment-list"),
    path("enrollments/<uuid:pk>/", enrollment_detail, name="enrollment-detail"),
    path("enrollments/<uuid:pk>/complete/", enrollment_complete, name="enrollment-complete"),
]
