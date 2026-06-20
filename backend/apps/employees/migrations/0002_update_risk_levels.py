from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("employees", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="employee",
            name="risk_level",
            field=models.CharField(
                choices=[
                    ("low", "Low"),
                    ("medium", "Medium"),
                    ("high", "High"),
                    ("critical", "Critical"),
                ],
                default="low",
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name="employeerisksnapshot",
            name="risk_level",
            field=models.CharField(
                choices=[
                    ("low", "Low"),
                    ("medium", "Medium"),
                    ("high", "High"),
                    ("critical", "Critical"),
                ],
                max_length=10,
            ),
        ),
    ]
