from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'city', 'interests',
            'avatar', 'email_notifications', 'push_notifications',
            'notification_frequency', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'city', 'interests', 'avatar',
            'email_notifications', 'push_notifications', 'notification_frequency'
        ]