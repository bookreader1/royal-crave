
from django.urls import path
from .views import RegisterView, ProfileView, UserListView
from .views import SendOTPView

from django.urls import path, include
# from rest_framework.routers import DefaultView
from rest_framework.routers import DefaultRouter


urlpatterns = [
    # Maps to http://127.0.0.1:8000/api/users/
    path('', UserListView.as_view(), name='user-list'), 
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp')
]
