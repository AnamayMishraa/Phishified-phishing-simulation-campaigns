import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

import django
django.setup()

from apps.accounts.models import User

user = User.objects.filter(email="anamaymishra26@gmail.com").first()
if user:
    print(f"User found: email={user.email} is_active={user.is_active}")
    pw_ok = user.check_password("anamay2002")
    print(f"Password 'anamay2002' matches: {pw_ok}")
else:
    print("User NOT found")
    print("Existing users:")
    for u in User.objects.all():
        print(f"  id={u.id} email={u.email} is_active={u.is_active}")
