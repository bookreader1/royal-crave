from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

# Fetch all users for the Admin Dashboard
class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser or getattr(user, 'role', '') == 'admin':
            return User.objects.all().order_by('-id')
        return User.objects.none()
    

import random
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Temporary memory storage for demonstration (or use Django cache/User model)
OTP_STORAGE = {}

class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = str(random.randint(100000, 999999))
        OTP_STORAGE[email] = otp  # Save temporarily
        
        try:
            send_mail(
                'Your Royal Crave Verification Code',
                f'Your OTP code is: {otp}',
                None,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'OTP sent successfully to your email.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    