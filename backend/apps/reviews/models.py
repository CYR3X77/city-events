from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.events.models import Event

class Review(models.Model):
    """Модель отзыва о мероприятии"""
    
    STATUS_CHOICES = [
        ('pending', 'На модерации'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='Мероприятие'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='Пользователь'
    )
    
    rating = models.PositiveSmallIntegerField(
        'Оценка',
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text = models.TextField('Текст отзыва')
    
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']
        unique_together = ['event', 'user']
        indexes = [
            models.Index(fields=['event', 'status']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.user.username} - {self.event.title} ({self.rating}⭐)'