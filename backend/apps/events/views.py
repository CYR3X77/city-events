from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Event, Category, UserEventInteraction
from .serializers import (
    EventListSerializer, EventDetailSerializer, EventCreateUpdateSerializer,
    CategorySerializer, UserEventInteractionSerializer
)
from .filters import EventFilter

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для категорий мероприятий"""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet для мероприятий"""
    
    queryset = Event.objects.select_related('category').filter(status='published')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EventFilter
    search_fields = ['title', 'description', 'organizer', 'city']
    ordering_fields = ['start_date', 'created_at', 'views_count']
    ordering = ['start_date']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Возвращает соответствующий сериализатор"""
        if self.action == 'list':
            return EventListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        return EventDetailSerializer
    
    def get_queryset(self):
        """Фильтрация событий (только будущие по умолчанию)"""
        queryset = super().get_queryset()
        
        # Фильтр по дате (только будущие события)
        show_past = self.request.query_params.get('show_past', 'false')
        if show_past.lower() != 'true':
            queryset = queryset.filter(start_date__gte=timezone.now().date())
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Увеличиваем счетчик просмотров при просмотре детальной информации"""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Сохраняем создателя мероприятия"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_interested(self, request, slug=None):
        """Отметить мероприятие как интересное"""
        event = self.get_object()
        interaction, created = UserEventInteraction.objects.get_or_create(
            user=request.user,
            event=event,
            interaction_type='interested'
        )
        
        if not created:
            interaction.delete()
            return Response({'status': 'removed'}, status=status.HTTP_200_OK)
        
        return Response({'status': 'added'}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_going(self, request, slug=None):
        """Отметить что пользователь идет на мероприятие"""
        event = self.get_object()
        interaction, created = UserEventInteraction.objects.get_or_create(
            user=request.user,
            event=event,
            interaction_type='going'
        )
        
        if not created:
            interaction.delete()
            return Response({'status': 'removed'}, status=status.HTTP_200_OK)
        
        return Response({'status': 'added'}, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_events(self, request):
        """Получить мероприятия пользователя (интересные и те, на которые он идет)"""
        interaction_type = request.query_params.get('type', 'all')
        
        interactions = UserEventInteraction.objects.filter(user=request.user)
        if interaction_type != 'all':
            interactions = interactions.filter(interaction_type=interaction_type)
        
        event_ids = interactions.values_list('event_id', flat=True)
        events = Event.objects.filter(id__in=event_ids, status='published')
        
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = EventListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = EventListSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Получить рекомендуемые мероприятия"""
        events = self.get_queryset().filter(is_featured=True)[:10]
        serializer = EventListSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)


class UserEventInteractionViewSet(viewsets.ModelViewSet):
    """ViewSet для взаимодействий пользователя с мероприятиями"""
    
    serializer_class = UserEventInteractionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Возвращает только взаимодействия текущего пользователя"""
        return UserEventInteraction.objects.filter(
            user=self.request.user
        ).select_related('event', 'event__category')
    
    def perform_create(self, serializer):
        """Сохраняем текущего пользователя"""
        serializer.save(user=self.request.user)