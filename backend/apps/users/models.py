from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """Кастомная модель пользователя с дополнительными полями"""
    
    email = models.EmailField('Email', unique=True)
    city = models.CharField('Город', max_length=100, blank=True)
    interests = models.TextField('Интересы', blank=True, help_text='Перечислите через запятую')
    avatar = models.ImageField('Аватар', upload_to='avatars/', blank=True, null=True)
    
    # Настройки уведомлений
    email_notifications = models.BooleanField('Email уведомления', default=True)
    push_notifications = models.BooleanField('Push уведомления', default=False)
    notification_frequency = models.CharField(
        'Частота уведомлений',
        max_length=20,
        choices=[
            ('daily', 'Ежедневно'),
            ('weekly', 'Еженедельно'),
            ('instant', 'Мгновенно'),
        ],
        default='weekly'
    )
    
    created_at = models.DateTimeField('Дата регистрации', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.username
    
    def get_interests_list(self):
        """Возвращает список интересов"""
        if self.interests:
            return [interest.strip() for interest in self.interests.split(',')]
        return []