from rest_framework import serializers
from .models import ServiceRule, Reward, PointEntry
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRule
        fields = ("id", "name", "category", "base_points", "bonus_points")
class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ("id", "name", "description", "points_cost", "stock")
class PointEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = PointEntry
        fields = ("id", "kind", "points", "description", "reference", "created_at")
