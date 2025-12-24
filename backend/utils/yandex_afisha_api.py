import requests
from django.conf import settings
from datetime import datetime
from apps.events.models import Event, Category
from django.utils.text import slugify

class YandexAfishaAPI:
    """
    Интеграция с API Яндекс.Афиша для импорта мероприятий
    
    Примечание: Яндекс.Афиша не предоставляет публичного API.
    Этот класс демонстрирует структуру для возможной интеграции.
    В реальности можно использовать:
    - Парсинг RSS/XML фидов
    - Kudago API (бесплатная альтернатива)
    - Timepad API
    """
    
    BASE_URL = 'https://api.kudago.com/public-api/v1.4'
    
    def __init__(self):
        self.session = requests.Session()
    
    def fetch_events(self, city='msk', days=30):
        """
        Получить события из API
        
        Args:
            city: код города (msk, spb и т.д.)
            days: количество дней вперед
        """
        try:
            url = f'{self.BASE_URL}/events/'
            params = {
                'location': city,
                'fields': 'id,title,description,dates,price,images,place,categories',
                'expand': 'place,images',
                'actual_since': int(datetime.now().timestamp()),
                'page_size': 100
            }
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return data.get('results', [])
        
        except requests.RequestException as e:
            print(f"Ошибка при запросе к API: {e}")
            return []
    
    def import_events(self, city='msk', limit=50):
        """
        Импортировать события в базу данных
        
        Args:
            city: код города
            limit: максимальное количество событий
        """
        events_data = self.fetch_events(city)
        imported_count = 0
        
        for event_data in events_data[:limit]:
            try:
                # Проверяем, не импортировано ли уже событие
                external_id = str(event_data.get('id'))
                if Event.objects.filter(external_id=external_id, source='kudago').exists():
                    continue
                
                # Получаем или создаем категорию
                category = self._get_or_create_category(event_data.get('categories', []))
                
                # Парсим даты
                dates = event_data.get('dates', [])
                start_date = None
                start_time = None
                
                if dates and len(dates) > 0:
                    start_timestamp = dates[0].get('start')
                    if start_timestamp:
                        dt = datetime.fromtimestamp(start_timestamp)
                        start_date = dt.date()
                        start_time = dt.time()
                
                if not start_date:
                    continue  # Пропускаем события без даты
                
                # Парсим место проведения
                place = event_data.get('place', {})
                city_name = place.get('location', 'Москва')
                address = place.get('address', '')
                venue_name = place.get('title', '')
                coords = place.get('coords', {})
                latitude = coords.get('lat')
                longitude = coords.get('lon')
                
                # Получаем изображение
                images = event_data.get('images', [])
                image_url = images[0].get('image') if images else None
                
                # Парсим цену
                price = event_data.get('price', '')
                is_free = price.lower() == 'бесплатно' or not price
                
                # Создаем событие
                event = Event.objects.create(
                    title=event_data.get('title', 'Без названия'),
                    slug=self._generate_unique_slug(event_data.get('title', 'event')),
                    description=event_data.get('description', ''),
                    short_description=event_data.get('short_title', '')[:300],
                    category=category,
                    start_date=start_date,
                    start_time=start_time,
                    city=city_name,
                    address=address,
                    venue_name=venue_name,
                    latitude=latitude,
                    longitude=longitude,
                    organizer='Импорт из KudaGo',
                    is_free=is_free,
                    source='kudago',
                    external_id=external_id,
                    status='published'
                )
                
                imported_count += 1
                print(f"Импортировано: {event.title}")
            
            except Exception as e:
                print(f"Ошибка при импорте события: {e}")
                continue
        
        return imported_count
    
    def _get_or_create_category(self, categories_data):
        """Получить или создать категорию"""
        if not categories_data:
            category, _ = Category.objects.get_or_create(
                slug='other',
                defaults={'name': 'Прочее'}
            )
            return category
        
        # Берем первую категорию
        category_slug = categories_data[0] if isinstance(categories_data[0], str) else 'other'
        category_name = category_slug.replace('-', ' ').title()
        
        category, _ = Category.objects.get_or_create(
            slug=category_slug,
            defaults={'name': category_name}
        )
        
        return category
    
    def _generate_unique_slug(self, title):
        """Генерирует уникальный slug"""
        base_slug = slugify(title)
        slug = base_slug
        counter = 1
        
        while Event.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug


# Management команда для запуска импорта
# python manage.py import_events --city=msk --limit=100