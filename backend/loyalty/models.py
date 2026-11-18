from django.conf import settings
from django.db import models
from django.db.models import Sum

class ServiceRule(models.Model):
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=80, blank=True)
    base_points = models.PositiveIntegerField(default=0)
    bonus_points = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    def __str__(self): return self.name

class Reward(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    points_cost = models.PositiveIntegerField()
    active = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(null=True, blank=True)
    def __str__(self): return self.name

class PointEntry(models.Model):
    class Kind(models.TextChoices):
        EARN = "EARN", "Earn"
        REDEEM = "REDEEM", "Redeem"
        ADJUST = "ADJUST", "Adjustment"
        EXPIRE = "EXPIRE", "Expire"
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="point_entries")
    kind = models.CharField(max_length=10, choices=Kind.choices)
    points = models.IntegerField(help_text="Positive for earned/adjusted credit, negative for redemption/expiry")
    description = models.CharField(max_length=200)
    reference = models.CharField(max_length=80, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]
    def __str__(self): return f"{self.customer.phone}: {self.points} pts"

class ServiceTransaction(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    service = models.ForeignKey(ServiceRule, on_delete=models.PROTECT)
    invoice_reference = models.CharField(max_length=80, unique=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="ILS")
    completed = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.invoice_reference

class Redemption(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    reward = models.ForeignKey(Reward, on_delete=models.PROTECT)
    ledger_entry = models.OneToOneField(PointEntry, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
