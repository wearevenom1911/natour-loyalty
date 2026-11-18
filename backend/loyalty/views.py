from django.core.exceptions import ValidationError
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from .models import ServiceRule, Reward
from .serializers import ServiceSerializer, RewardSerializer, PointEntrySerializer
from .services import redeem_reward

class PublicList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

class ServiceList(PublicList):
    queryset = ServiceRule.objects.filter(active=True)
    serializer_class = ServiceSerializer

class RewardList(PublicList):
    queryset = Reward.objects.filter(active=True)
    serializer_class = RewardSerializer

class MyLoyaltyView(APIView):
    def get(self, request):
        entries = request.user.point_entries.all()[:30]
        balance = request.user.point_entries.aggregate(total=Sum("points"))["total"] or 0
        return Response({"phone": request.user.phone, "balance": balance,
                         "history": PointEntrySerializer(entries, many=True).data})

class RedeemView(APIView):
    def post(self, request):
        reward_id = request.data.get("reward_id")
        try:
            reward = Reward.objects.get(pk=reward_id, active=True)
            entry = redeem_reward(customer=request.user, reward=reward)
        except Reward.DoesNotExist:
            return Response({"detail": "Reward not found."}, status=404)
        except ValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Reward redeemed.", "points": entry.points}, status=201)
