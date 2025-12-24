from django.db import models
from django.conf import settings
from apps.events.models import Event

class Notification(models.Model):
    """Модель уведомления"""
    
    TYPE_CHOICES = [
        ('new_event', 'Новое мероприятие'),
        ('event_reminder', 'Напоминание о мероприятии'),
        ('event_update', 'Обновление мероприятия'),
        ('event_cancelled', 'Отмена мероприятия'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Пользователь'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Мероприятие',
        null=True,
        blank=True
    )
    
    notification_type = models.CharField('Тип уведомления', max_length=20, choices=TYPE_CHOICES)
    title = models.CharField('Заголовок', max_length=200)
    message = models.TextField('Сообщение')
    
    is_read = models.BooleanField('Прочитано', default=False)
    is_sent = models.BooleanField('Отправлено', default=False)
    
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    sent_at = models.DateTimeField('Дата отправки', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['is_sent', 'created_at']),
        ]
    
    def __str__(self):
        return f'{self.user.username} - {self.title}'


class PushSubscription(models.Model):
    """Модель подписки на push-уведомления"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='push_subscriptions',
        verbose_name='Пользователь'
    )
    
    endpoint = models.URLField('Endpoint', unique=True)
    p256dh = models.CharField('P256dh ключ', max_length=255)
    auth = models.CharField('Auth ключ', max_length=255)
    
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Push подписка'
        verbose_name_plural = 'Push подписки'
    
    def __str__(self):
        return f'{self.user.username} - Push subscription'