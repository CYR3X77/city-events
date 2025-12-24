from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from apps.events.models import Event, UserEventInteraction
from apps.users.models import CustomUser
from .models import Notification

@shared_task
def send_notification_email(notification_id):
    """Отправка email уведомления"""
    try:
        notification = Notification.objects.get(id=notification_id)
        
        if notification.user.email_notifications:
            send_mail(
                subject=notification.title,
                message=notification.message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notification.user.email],
                fail_silently=False,
            )
            
            notification.is_sent = True
            notification.sent_at = timezone.now()
            notification.save()
            
            return f"Email отправлен пользователю {notification.user.email}"
    
    except Notification.DoesNotExist:
        return "Уведомление не найдено"
    except Exception as e:
        return f"Ошибка отправки email: {str(e)}"


@shared_task
def send_event_reminders():
    """
    Отправка напоминаний о предстоящих мероприятиях
    Запускается ежедневно через Celery Beat
    """
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    # Получаем мероприятия, которые начнутся завтра
    upcoming_events = Event.objects.filter(
        start_date=tomorrow,
        status='published'
    )
    
    sent_count = 0
    
    for event in upcoming_events:
        # Находим пользователей, которые отметили "я пойду"
        interactions = UserEventInteraction.objects.filter(
            event=event,
            interaction_type='going'
        ).select_related('user')
        
        for interaction in interactions:
            user = interaction.user
            
            if user.email_notifications:
                # Создаем уведомление
                notification = Notification.objects.create(
                    user=user,
                    event=event,
                    notification_type='event_reminder',
                    title=f'Напоминание: {event.title}',
                    message=f'Завтра состоится мероприятие "{event.title}" в {event.start_time if event.start_time else "указанное время"}. Место: {event.address}'
                )
                
                # Отправляем email асинхронно
                send_notification_email.delay(notification.id)
                sent_count += 1
    
    return f"Отправлено {sent_count} напоминаний"


@shared_task
def send_new_events_digest():
    """
    Отправка дайджеста новых мероприятий пользователям
    Запускается согласно настройкам частоты уведомлений пользователя
    """
    # Получаем пользователей с включенными уведомлениями
    users = CustomUser.objects.filter(email_notifications=True)
    
    sent_count = 0
    
    for user in users:
        # Определяем период в зависимости от частоты уведомлений
        if user.notification_frequency == 'daily':
            days_back = 1
        elif user.notification_frequency == 'weekly':
            days_back = 7
        else:
            continue  # instant обрабатывается отдельно
        
        date_from = timezone.now().date() - timedelta(days=days_back)
        
        # Получаем новые события в городе пользователя
        new_events = Event.objects.filter(
            city__icontains=user.city,
            created_at__date__gte=date_from,
            status='published',
            start_date__gte=timezone.now().date()
        ).order_by('-created_at')[:10]
        
        if new_events.exists():
            # Формируем сообщение
            events_list = '\n'.join([
                f"- {event.title} ({event.start_date}, {event.address})"
                for event in new_events
            ])
            
            notification = Notification.objects.create(
                user=user,
                notification_type='new_event',
                title=f'Новые мероприятия в городе {user.city}',
                message=f'За последние {days_back} дней в вашем городе добавлены новые мероприятия:\n\n{events_list}'
            )
            
            send_notification_email.delay(notification.id)
            sent_count += 1
    
    return f"Отправлено {sent_count} дайджестов"


@shared_task
def notify_event_update(event_id):
    """Уведомление об изменении мероприятия"""
    try:
        event = Event.objects.get(id=event_id)
        
        # Находим пользователей, которые проявили интерес к мероприятию
        interactions = UserEventInteraction.objects.filter(
            event=event
        ).select_related('user')
        
        for interaction in interactions:
            user = interaction.user
            
            if user.email_notifications:
                notification = Notification.objects.create(
                    user=user,
                    event=event,
                    notification_type='event_update',
                    title=f'Обновление мероприятия: {event.title}',
                    message=f'Мероприятие "{event.title}" было обновлено. Проверьте актуальную информацию.'
                )
                
                send_notification_email.delay(notification.id)
        
        return "Уведомления отправлены"
    
    except Event.DoesNotExist:
        return "Мероприятие не найдено"


@shared_task
def notify_event_cancelled(event_id):
    """Уведомление об отмене мероприятия"""
    try:
        event = Event.objects.get(id=event_id)
        
        interactions = UserEventInteraction.objects.filter(
            event=event
        ).select_related('user')
        
        for interaction in interactions:
            user = interaction.user
            
            if user.email_notifications:
                notification = Notification.objects.create(
                    user=user,
                    event=event,
                    notification_type='event_cancelled',
                    title=f'Отмена мероприятия: {event.title}',
                    message=f'К сожалению, мероприятие "{event.title}" было отменено.'
                )
                
                send_notification_email.delay(notification.id)
        
        return "Уведомления об отмене отправлены"
    
    except Event.DoesNotExist:
        return "Мероприятие не найдено"