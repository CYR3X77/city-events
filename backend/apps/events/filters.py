import django_filters
from .models import Event

class EventFilter(django_filters.FilterSet):
    """Фильтры для мероприятий согласно ТЗ (п. 2.1.2.2)"""
    
    # Поиск по ключевым словам
    search = django_filters.CharFilter(method='search_filter', label='Поиск')
    
    # Фильтрация по дате
    start_date_from = django_filters.DateFilter(field_name='start_date', lookup_expr='gte', label='Дата от')
    start_date_to = django_filters.DateFilter(field_name='start_date', lookup_expr='lte', label='Дата до')
    
    # Фильтрация по категории
    category = django_filters.CharFilter(field_name='category__slug', label='Категория')
    
    # Фильтрация по местоположению
    city = django_filters.CharFilter(lookup_expr='icontains', label='Город')
    
    # Бесплатные/платные
    is_free = django_filters.BooleanFilter(label='Бесплатное')
    
    # Возрастные ограничения
    age_restriction = django_filters.ChoiceFilter(
        choices=Event.AGE_CHOICES,
        label='Возрастное ограничение'
    )
    
    # Организатор
    organizer = django_filters.CharFilter(lookup_expr='icontains', label='Организатор')
    
    # Рекомендуемые
    is_featured = django_filters.BooleanFilter(label='Рекомендуемое')
    
    class Meta:
        model = Event
        fields = [
            'search', 'start_date_from', 'start_date_to', 'category',
            'city', 'is_free', 'age_restriction', 'organizer', 'is_featured'
        ]
    
    def search_filter(self, queryset, name, value):
        """Комплексный поиск по нескольким полям"""
        return queryset.filter(
            models.Q(title__icontains=value) |
            models.Q(description__icontains=value) |
            models.Q(organizer__icontains=value) |
            models.Q(venue_name__icontains=value)
        )