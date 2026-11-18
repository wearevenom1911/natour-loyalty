from django.db import transaction
from django.core.exceptions import ValidationError
from .models import PointEntry, Redemption

def balance_for(customer):
    from django.db.models import Sum
    return customer.point_entries.aggregate(total=Sum("points"))["total"] or 0

@transaction.atomic
def redeem_reward(*, customer, reward):
    reward = type(reward).objects.select_for_update().get(pk=reward.pk, active=True)
    balance = balance_for(customer)
    if balance < reward.points_cost:
        raise ValidationError("Insufficient points.")
    if reward.stock is not None and reward.stock < 1:
        raise ValidationError("Reward is out of stock.")
    entry = PointEntry.objects.create(
        customer=customer, kind=PointEntry.Kind.REDEEM,
        points=-reward.points_cost, description=f"Redeemed: {reward.name}"
    )
    Redemption.objects.create(customer=customer, reward=reward, ledger_entry=entry)
    if reward.stock is not None:
        reward.stock -= 1
        reward.save(update_fields=["stock"])
    return entry

@transaction.atomic
def approve_service_transaction(service_transaction):
    from .models import ServiceTransaction
    tx = ServiceTransaction.objects.select_for_update().select_related("service").get(pk=service_transaction.pk)
    if not tx.completed:
        raise ValidationError("Service must be marked completed before approval.")
    if tx.approved:
        raise ValidationError("Transaction already approved.")
    points = tx.service.base_points + tx.service.bonus_points
    if points <= 0:
        raise ValidationError("This service has no configured points.")
    PointEntry.objects.create(
        customer=tx.customer, kind=PointEntry.Kind.EARN, points=points,
        description=f"Completed service: {tx.service.name}",
        reference=tx.invoice_reference,
    )
    tx.approved = True
    tx.save(update_fields=["approved"])
    return points
