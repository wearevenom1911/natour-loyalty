from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    username = None
    phone = models.CharField(max_length=24, unique=True)
    email = models.EmailField(blank=True)
    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []
