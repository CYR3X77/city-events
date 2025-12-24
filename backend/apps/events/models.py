from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg

class Category(models.Model):
    """Категории мероприятий"""
    
    name = models.CharField('Название', max_length=100, unique=True)
    slug = models.SlugField('Слаг', unique=True)
    description = models.TextField('Описание', blank=True)
    icon = models.CharField('Иконка', max_length=50, blank=True, help_text='Название иконки')
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Event(models.Model):
    """Модель мероприятия"""
    
    AGE_CHOICES = [
        ('0+', '0+'),
        ('6+', '6+'),
        ('12+', '12+'),
        ('16+', '16+'),
        ('18+', '18+'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('published', 'Опубликовано'),
        ('cancelled', 'Отменено'),
        ('completed', 'Завершено'),
    ]
    
    # Основная информация
    title = models.CharField('Название', max_length=200)
    slug = models.SlugField('Слаг', unique=True, blank=True)
    description = models.TextField('Описание')
    short_description = models.CharField('Краткое описание', max_length=300, blank=True)
    
    # Категория и тип
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='events',
        verbose_name='Категория'
    )
    
    # Дата и время
    start_date = models.DateField('Дата начала')
    start_time = models.TimeField('Время начала', null=True, blank=True)
    end_date = models.DateField('Дата окончания', null=True, blank=True)
    end_time = models.TimeField('Время окончания', null=True, blank=True)
    
    # Местоположение
    address = models.CharField('Адрес', max_length=300)
    city = models.CharField('Город', max_length=100)
    latitude = models.DecimalField('Широта', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Долгота', max_digits=9, decimal_places=6, null=True, blank=True)
    venue_name = models.CharField('Название места', max_length=200, blank=True)
    
    # Организатор
    organizer = models.CharField('Организатор', max_length=200)
    organizer_email = models.EmailField('Email организатора', blank=True)
    organizer_phone = models.CharField('Телефон организатора', max_length=20, blank=True)
    organizer_website = models.URLField('Сайт организатора', blank=True)
    
    # Стоимость
    is_free = models.BooleanField('Бесплатное', default=True)
    price_min = models.DecimalField(
        'Минимальная цена',
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    price_max = models.DecimalField(
        'Максимальная цена',
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    ticket_url = models.URLField('Ссылка на покупку билетов', blank=True)
    
    # Дополнительная информация
    age_restriction = models.CharField('Возрастное ограничение', max_length=3, choices=AGE_CHOICES, default='0+')
    image = models.ImageField('Изображение', upload_to='events/', blank=True, null=True)
    video_url = models.URLField('Ссылка на видео', blank=True)
    
    # Статус и модерация
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='published')
    is_featured = models.BooleanField('Рекомендуемое', default=False)
    
    # Источник данных
    source = models.CharField('Источник', max_length=50, default='manual', help_text='manual или yandex_afisha')
    external_id = models.CharField('Внешний ID', max_length=100, blank=True, help_text='ID из внешнего API')
    
    # Метаданные
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_events',
        verbose_name='Создано пользователем'
    )
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    # Счетчики
    views_count = models.PositiveIntegerField('Количество просмотров', default=0)
    
    class Meta:
        verbose_name = 'Мероприятие'
        verbose_name_plural = 'Мероприятия'
        ordering = ['start_date', 'start_time']
        indexes = [
            models.Index(fields=['start_date', 'city']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_average_rating(self):
        """Возвращает средний рейтинг мероприятия"""
        avg = self.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0
    
    def get_reviews_count(self):
        """Возвращает количество отзывов"""
        return self.reviews.count()
    
    def increment_views(self):
        """Увеличивает счетчик просмотров"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class UserEventInteraction(models.Model):
    """Взаимодействие пользователя с мероприятием"""
    
    INTERACTION_CHOICES = [
        ('interested', 'Интересно'),
        ('going', 'Я пойду'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_interactions',
        verbose_name='Пользователь'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='user_interactions',
        verbose_name='Мероприятие'
    )
    interaction_type = models.CharField('Тип взаимодействия', max_length=20, choices=INTERACTION_CHOICES)
    created_at = models.DateTimeField('Дата добавления', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Взаимодействие с мероприятием'
        verbose_name_plural = 'Взаимодействия с мероприятиями'
        unique_together = ['user', 'event', 'interaction_type']
    
    def __str__(self):
        return f'{self.user.username} - {self.event.title} ({self.get_interaction_type_display()})'