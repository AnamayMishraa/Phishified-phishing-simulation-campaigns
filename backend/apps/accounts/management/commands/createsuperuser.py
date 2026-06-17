from django.contrib.auth.management.commands import createsuperuser as base
from django.core.exceptions import ValidationError
from django.core.management.base import CommandError

from apps.organizations.models import Organization


class Command(base.Command):
    help = "Create a superuser with automatic organization selection."

    def _resolve_org(self, org_input):
        try:
            return Organization.objects.get(id=org_input)
        except (ValidationError, ValueError, Organization.DoesNotExist):
            try:
                return Organization.objects.get(name__iexact=org_input)
            except Organization.DoesNotExist:
                raise CommandError(
                    f"Organization matching '{org_input}' not found."
                )

    def get_organization(self, options):
        org_input = options.get("organization")

        if org_input:
            org = self._resolve_org(org_input)
            return str(org.id), org.name

        count = Organization.objects.count()

        if count == 0:
            raise CommandError(
                "No organizations exist. Create one before running createsuperuser."
            )

        if count == 1:
            org = Organization.objects.first()
            self.stdout.write(f"Auto-selected organization: {org.name}")
            return str(org.id), org.name

        self.stdout.write("Available organizations:")
        for i, org in enumerate(Organization.objects.all(), 1):
            self.stdout.write(f"  {i}. {org.name}")

        while True:
            choice = input("Select organization by number: ").strip()
            try:
                idx = int(choice)
                if 1 <= idx <= count:
                    org = list(Organization.objects.all())[idx - 1]
                    return str(org.id), org.name
            except ValueError:
                pass
            self.stderr.write(f"Invalid choice. Enter 1-{count}.")

    def handle(self, *args, **options):
        org_id, org_name = self.get_organization(options)
        options["organization"] = org_id
        return super().handle(*args, **options)
