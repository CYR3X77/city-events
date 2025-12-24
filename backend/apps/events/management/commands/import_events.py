# backend/apps/events/management/commands/import_events.py

from django.core.management.base import BaseCommand
from utils.yandex_afisha_api import YandexAfishaAPI

class Command(BaseCommand):
    help = 'Импорт мероприятий из внешнего API (KudaGo)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--city',
            type=str,
            default='msk',
            help='Код города (msk, spb, etc.)'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=50,
            help='Максимальное количество событий для импорта'
        )

    def handle(self, *args, **options):
        city = options['city']
        limit = options['limit']

        self.stdout.write(f'Начинаем импорт событий для города: {city}')
        self.stdout.write(f'Лимит: {limit} событий')

        api = YandexAfishaAPI()
        
        try:
            imported_count = api.import_events(city=city, limit=limit)
            
            self.stdout.write(
                self.style.SUCCESS(f'Успешно импортировано событий: {imported_count}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Ошибка при импорте: {str(e)}')
            )