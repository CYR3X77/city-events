from rest_framework import serializers
from .models import Event, Category, UserEventInteraction

class CategorySerializer(serializers.ModelSerializer):
    """Сериализатор категории"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon']


class EventListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка мероприятий (краткая информация)"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'short_description', 'image',
            'start_date', 'start_time', 'city', 'address', 'venue_name',
            'category', 'category_name', 'is_free', 'price_min', 'price_max',
            'age_restriction', 'average_rating', 'reviews_count',
            'views_count', 'is_featured'
        ]
    
    def get_average_rating(self, obj):
        return obj.get_average_rating()
    
    def get_reviews_count(self, obj):
        return obj.get_reviews_count()


class EventDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детального просмотра мероприятия"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    user_interaction = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'category', 'category_name', 'start_date', 'start_time',
            'end_date', 'end_time', 'address', 'city', 'venue_name',
            'latitude', 'longitude', 'organizer', 'organizer_email',
            'organizer_phone', 'organizer_website', 'is_free',
            'price_min', 'price_max', 'ticket_url', 'age_restriction',
            'image', 'video_url', 'status', 'is_featured',
            'average_rating', 'reviews_count', 'views_count',
            'created_at', 'updated_at', 'user_interaction'
        ]
    
    def get_average_rating(self, obj):
        return obj.get_average_rating()
    
    def get_reviews_count(self, obj):
        return obj.get_reviews_count()
    
    def get_user_interaction(self, obj):
        """Возвращает взаимодействия текущего пользователя с мероприятием"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            interactions = UserEventInteraction.objects.filter(
                user=request.user,
                event=obj
            ).values_list('interaction_type', flat=True)
            return list(interactions)
        return []


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания/обновления мероприятия"""
    
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'short_description', 'category',
            'start_date', 'start_time', 'end_date', 'end_time',
            'address', 'city', 'venue_name', 'latitude', 'longitude',
            'organizer', 'organizer_email', 'organizer_phone',
            'organizer_website', 'is_free', 'price_min', 'price_max',
            'ticket_url', 'age_restriction', 'image', 'video_url', 'status'
        ]
    
    def validate(self, data):
        """Валидация данных"""
        if not data.get('is_free'):
            if not data.get('price_min') and not data.get('price_max'):
                raise serializers.ValidationError(
                    "Для платного мероприятия необходимо указать цену"
                )
        
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError(
                    "Дата окончания не может быть раньше даты начала"
                )
        
        return data


class UserEventInteractionSerializer(serializers.ModelSerializer):
    """Сериализатор для взаимодействий пользователя с мероприятиями"""
    
    event_detail = EventListSerializer(source='event', read_only=True)
    
    class Meta:
        model = UserEventInteraction
        fields = ['id', 'event', 'event_detail', 'interaction_type', 'created_at']
        read_only_fields = ['created_at']