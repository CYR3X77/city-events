from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'event', 'user', 'user_username', 'user_avatar',
            'rating', 'text', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Рейтинг должен быть от 1 до 5")
        return value
    
    def validate_text(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Отзыв должен содержать минимум 10 символов")
        return value