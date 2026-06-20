import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.email.services import EmailRenderer
from apps.campaigns.models import Campaign, CampaignAssignment
from apps.templates.models import EmailTemplate
from apps.employees.models import Employee
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization

# Get or create test data
org, _ = Organization.objects.get_or_create(name='RenderTest', slug='render-test')
User = get_user_model()
user, _ = User.objects.get_or_create(email='render@test.com', organization=org, defaults={'name': 'Render'})
emp, _ = Employee.objects.get_or_create(organization=org, email='emp@test.com', defaults={'first_name': 'Test', 'last_name': 'User'})

# Create a template using {{tracking_url}}
tmpl, _ = EmailTemplate.objects.get_or_create(
    organization=org,
    name='Test Tracking',
    defaults={
        'category': 'link_click',
        'subject': 'Click here {{first_name}}',
        'html_content': (
            '<h1>Hi {{first_name}} {{last_name}}</h1>\n'
            '<a href="{{tracking_url}}">Click here</a>\n'
            '<p>Report: <a href="{{report_url}}">Report</a></p>\n'
        ),
        'plain_text_content': 'Click: {{tracking_url}}\nReport: {{report_url}}',
    }
)

camp, _ = Campaign.objects.get_or_create(
    organization=org,
    name='RenderTest Campaign',
    defaults={'email_template': tmpl, 'status': 'draft'}
)

assn, _ = CampaignAssignment.objects.get_or_create(
    campaign=camp,
    employee=emp,
)

html, text = EmailRenderer.render(assn)

print('=== HTML OUTPUT ===')
print(html)
print()
print('=== PLAINTEXT OUTPUT ===')
print(text)

print()
for ph in ['{{tracking_url}}', '{{report_url}}', '{{first_name}}', '{{last_name}}']:
    if ph in html:
        print(f'UNREPLACED: {ph} found in HTML output')
    else:
        print(f'OK: {ph} was replaced in HTML')

if '{{tracking_url}}' in html:
    print('FAIL: {{tracking_url}} still present in HTML')
else:
    print('PASS: {{tracking_url}} was correctly replaced')

# Cleanup
org.delete()
