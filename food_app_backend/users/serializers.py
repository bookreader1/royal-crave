from rest_framework import serializers
from django.contrib.auth import get_user_model
from .emails import send_html_welcome_email  # <--- Make sure this is imported

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'role']
        read_only_fields = ['role'] # Customers shouldn't be able to make themselves admins!

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role='customer' # Force new signups to be customers
        )
        # ---> TRIGGER THE HTML WELCOME EMAIL HERE <---
        try:
            send_html_welcome_email(user.email, user.first_name)
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
        return user