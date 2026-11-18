from django.urls import path
from .views import ServiceList, RewardList, MyLoyaltyView, RedeemView
urlpatterns = [
    path("services/", ServiceList.as_view()),
    path("rewards/", RewardList.as_view()),
    path("me/", MyLoyaltyView.as_view()),
    path("redeem/", RedeemView.as_view()),
]
