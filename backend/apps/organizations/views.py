import logging
import smtplib
import socket

from django.conf import settings
from django.core.mail import get_connection
from django.core.mail.message import EmailMessage
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.organizations.crypto import decrypt_value
from apps.organizations.models import Department, InfrastructureSetting
from apps.organizations.serializers import DepartmentSerializer, InfrastructureSettingSerializer

logger = logging.getLogger(__name__)


class InfrastructureSettingView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj, _ = InfrastructureSetting.objects.get_or_create(
            organization=self.request.user.organization,
        )
        return obj

    def get(self, request):
        obj = self.get_object()
        serializer = InfrastructureSettingSerializer(obj)
        return Response(serializer.data)

    def put(self, request):
        obj = self.get_object()
        serializer = InfrastructureSettingSerializer(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)


class VerifySmtpView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org = request.user.organization
        try:
            infra = InfrastructureSetting.objects.get(organization=org)
        except InfrastructureSetting.DoesNotExist:
            return Response(
                {"detail": "Infrastructure settings not configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        host = infra.smtp_host
        port = infra.smtp_port
        username = infra.smtp_username

        if not host:
            return Response(
                {"detail": "SMTP host is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        password = ""
        if infra.smtp_password_enc:
            try:
                password = decrypt_value(infra.smtp_password_enc)
            except Exception:
                return Response(
                    {"detail": "Failed to decrypt SMTP password."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        use_tls = port == 587
        use_ssl = port == 465
        try:
            if use_tls:
                server = smtplib.SMTP(host, port, timeout=10)
                server.ehlo()
                server.starttls()
                server.ehlo()
            elif use_ssl:
                server = smtplib.SMTP_SSL(host, port, timeout=10)
            else:
                server = smtplib.SMTP(host, port, timeout=10)
                server.ehlo()

            if username:
                server.login(username, password)
            server.quit()

            infra.smtp_verified = True
            infra.save(update_fields=["smtp_verified"])

            return Response({
                "detail": "SMTP connection verified successfully.",
                "smtp_verified": True,
            })
        except smtplib.SMTPAuthenticationError:
            return Response(
                {"detail": "SMTP authentication failed. Check username and password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except (smtplib.SMTPException, socket.error) as e:
            return Response(
                {"detail": f"SMTP connection failed: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SendTestEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org = request.user.organization
        to_email = request.data.get("to_email", request.user.email)

        try:
            infra = InfrastructureSetting.objects.get(organization=org)
        except InfrastructureSetting.DoesNotExist:
            return Response(
                {"detail": "Infrastructure settings not configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not infra.smtp_host:
            return Response(
                {"detail": "SMTP not configured. Configure SMTP host first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        password = ""
        if infra.smtp_password_enc:
            try:
                password = decrypt_value(infra.smtp_password_enc)
            except Exception:
                return Response(
                    {"detail": "Failed to decrypt SMTP password."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        port = infra.smtp_port
        use_tls = port == 587
        use_ssl = port == 465

        try:
            conn_kwargs = {
                "backend": "django.core.mail.backends.smtp.EmailBackend",
                "host": infra.smtp_host,
                "port": port,
                "fail_silently": False,
            }
            if infra.smtp_username:
                conn_kwargs["username"] = infra.smtp_username
                conn_kwargs["password"] = password
            if use_tls:
                conn_kwargs["use_tls"] = True
            if use_ssl:
                conn_kwargs["use_ssl"] = True
            conn = get_connection(**conn_kwargs)

            from_email = infra.sender_email or settings.DEFAULT_FROM_EMAIL
            sender_name = infra.sender_name or ""
            if sender_name:
                from_email = f"{sender_name} <{from_email}>"

            msg = EmailMessage(
                subject="Phishified — Test Email",
                body=(
                    "This is a test email from Phishified.\n\n"
                    "If you received this, your SMTP configuration is working correctly."
                ),
                from_email=from_email,
                to=[to_email],
                connection=conn,
            )
            msg.send()

            infra.smtp_verified = True
            infra.save(update_fields=["smtp_verified"])

            return Response({"detail": f"Test email sent to {to_email}."})
        except Exception as e:
            logger.exception("Failed to send test email")
            return Response(
                {"detail": f"Failed to send test email: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ValidateDomainView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org = request.user.organization
        domain = request.data.get("domain", "").strip().lower()

        if not domain:
            return Response(
                {"detail": "Domain is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        domain = domain.replace("https://", "").replace("http://", "").split("/")[0]

        try:
            import dns.resolver
            try:
                answers = dns.resolver.resolve(domain, "A")
                ip = str(answers[0])
                try:
                    infra = InfrastructureSetting.objects.get(organization=org)
                    infra.landing_domain = domain
                    infra.landing_domain_verified = True
                    infra.save(update_fields=["landing_domain", "landing_domain_verified"])
                except InfrastructureSetting.DoesNotExist:
                    pass
                return Response({
                    "detail": f"Domain {domain} resolves to {ip}. DNS validation passed.",
                    "landing_domain_verified": True,
                })
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.LifetimeTimeout):
                try:
                    infra = InfrastructureSetting.objects.get(organization=org)
                    infra.landing_domain_verified = False
                    infra.save(update_fields=["landing_domain_verified"])
                except InfrastructureSetting.DoesNotExist:
                    pass
                return Response(
                    {"detail": f"Domain {domain} does not resolve to a valid IP address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except ImportError:
            try:
                ip = socket.gethostbyname(domain)
                try:
                    infra = InfrastructureSetting.objects.get(organization=org)
                    infra.landing_domain = domain
                    infra.landing_domain_verified = True
                    infra.save(update_fields=["landing_domain", "landing_domain_verified"])
                except InfrastructureSetting.DoesNotExist:
                    pass
                return Response({
                    "detail": f"Domain {domain} resolves to {ip}. DNS lookup passed.",
                    "landing_domain_verified": True,
                })
            except socket.gaierror:
                try:
                    infra = InfrastructureSetting.objects.get(organization=org)
                    infra.landing_domain_verified = False
                    infra.save(update_fields=["landing_domain_verified"])
                except InfrastructureSetting.DoesNotExist:
                    pass
                return Response(
                    {"detail": f"Domain {domain} could not be resolved."},
                    status=status.HTTP_400_BAD_REQUEST,
                )


class DepartmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        qs = Department.objects.filter(
            organization=self.request.user.organization,
        ).order_by("name")

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)

        return qs

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)
