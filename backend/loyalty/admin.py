from django.contrib import admin
from .models import ServiceRule, Reward, PointEntry, ServiceTransaction, Redemption
from .services import approve_service_transaction

@admin.register(ServiceTransaction)
class ServiceTransactionAdmin(admin.ModelAdmin):
    list_display = ("invoice_reference", "customer", "service", "completed", "approved", "created_at")
    list_filter = ("completed", "approved")
    actions = ["approve_completed_transactions"]
    @admin.action(description="Approve completed transactions and award points")
    def approve_completed_transactions(self, request, queryset):
        for tx in queryset:
            try:
                approve_service_transaction(tx)
            except Exception as exc:
                self.message_user(request, f"{tx.invoice_reference}: {exc}", level="ERROR")

admin.site.register(ServiceRule)
admin.site.register(Reward)
admin.site.register(PointEntry)
admin.site.register(Redemption)
