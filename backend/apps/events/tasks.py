from celery import shared_task
from .models import Event
from utils.yandex_afisha_api import YandexAfishaAPI

@shared_task
def import_events_from_kudago():
    """Автоматический импорт событий из KudaGo API"""
    api = YandexAfishaAPI()
    try:
        imported_count = api.import_events(city='msk', limit=50)
        return f"Импортировано событий: {imported_count}"
    except Exception as e:
        return f"Ошибка импорта: {str(e)}"