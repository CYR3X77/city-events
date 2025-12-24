import os
from celery import Celery
from celery.schedules import crontab

# Устанавливаем модуль настроек Django для Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('city_events')

# Загружаем конфигурацию из Django settings с префиксом CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматически находим задачи во всех приложениях
app.autodiscover_tasks()

# Периодические задачи согласно ТЗ (п. 2.1.4)
app.conf.beat_schedule = {
    # Отправка напоминаний о предстоящих мероприятиях (ежедневно в 10:00)
    'send-event-reminders': {
        'task': 'apps.notifications.tasks.send_event_reminders',
        'schedule': crontab(hour=10, minute=0),
    },
    # Отправка дайджестов новых событий (ежедневно в 9:00)
    'send-daily-digest': {
        'task': 'apps.notifications.tasks.send_new_events_digest',
        'schedule': crontab(hour=9, minute=0),
    },
    # Импорт событий из внешних источников (ежедневно в 2:00)
    'import-external-events': {
        'task': 'apps.events.tasks.import_events_from_kudago',
        'schedule': crontab(hour=2, minute=0),
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')