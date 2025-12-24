# Информационная система планирования городских мероприятий и событий (ИС ПГМС)

## Описание проекта

Веб-приложение для поиска, просмотра, оценки и получения уведомлений о городских мероприятиях и событиях. Разработано в соответствии с техническим заданием.

## Основные возможности

### Для пользователей
- ✅ Регистрация и авторизация (email, Google, VK)
- ✅ Поиск мероприятий по ключевым словам, дате, категории, местоположению
- ✅ Фильтрация мероприятий (бесплатные/платные, возраст, организатор)
- ✅ Детальный просмотр с картой местоположения
- ✅ Отзывы и рейтинги мероприятий
- ✅ Отметки "Интересно" и "Я пойду"
- ✅ Уведомления по email и push
- ✅ Личный кабинет с настройками

### Для администраторов
- ✅ Управление мероприятиями
- ✅ Модерация отзывов
- ✅ Управление пользователями
- ✅ Управление категориями
- ✅ Импорт событий из внешних источников

## Технологический стек

### Backend
- Python 3.11
- Django 4.2 + Django REST Framework
- PostgreSQL 14
- Celery + Redis (задачи и уведомления)
- Gunicorn (WSGI сервер)

### Frontend
- React 18
- React Router v6
- Axios (HTTP клиент)
- Leaflet.js + OpenStreetMap (карты)
- date-fns (работа с датами)
- React Icons

### DevOps
- Docker + Docker Compose
- Nginx (веб-сервер, reverse proxy)
- PostgreSQL (база данных)
- Redis (брокер сообщений)

## Быстрый старт

### Требования
- Docker и Docker Compose
- Git

### Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd city-events
```

2. Настройте переменные окружения:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Отредактируйте `backend/.env` и укажите необходимые настройки

4. Запустите проект:
```bash
docker-compose up -d --build
```

5. Выполните миграции и создайте суперпользователя:
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

6. Импортируйте начальные данные (категории и события):
```bash
docker-compose exec backend python manage.py loaddata categories
docker-compose exec backend python manage.py import_events --city=msk --limit=50
```

### Доступ к приложению

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1
- Admin панель: http://localhost:8000/admin
- API документация (Swagger): http://localhost:8000/api/docs

## Разработка без Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Настройте .env файл
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Запуск Celery:
```bash
# В отдельном терминале
celery -A config worker -l info

# Celery Beat для периодических задач
celery -A config beat -l info
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Структура проекта

```
city-events/
├── backend/              # Django приложение
│   ├── apps/            # Django приложения
│   │   ├── users/       # Пользователи
│   │   ├── events/      # Мероприятия
│   │   ├── reviews/     # Отзывы
│   │   └── notifications/  # Уведомления
│   ├── config/          # Настройки Django
│   └── utils/           # Утилиты (API интеграции)
├── frontend/            # React приложение
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы
│   │   └── services/    # API сервисы
│   └── public/
├── nginx/               # Конфигурация Nginx
├── docker-compose.yml   # Docker Compose конфигурация
└── README.md
```

## API Endpoints

### Основные эндпоинты:

- `GET /api/v1/events/` - Список мероприятий
- `GET /api/v1/events/{slug}/` - Детали мероприятия
- `POST /api/v1/events/{slug}/mark_interested/` - Отметить как интересное
- `POST /api/v1/events/{slug}/mark_going/` - Отметить "Я пойду"
- `GET /api/v1/categories/` - Список категорий
- `GET /api/v1/reviews/` - Отзывы
- `POST /api/v1/reviews/` - Создать отзыв
- `GET /api/v1/notifications/` - Уведомления пользователя

Полная документация API доступна по адресу: http://localhost:8000/api/docs

## Интеграции

### Яндекс.Афиша / KudaGo API
Система поддерживает импорт мероприятий из KudaGo API (бесплатная альтернатива):

```bash
python manage.py import_events --city=msk --limit=100
```

### Социальная авторизация
Настройте OAuth приложения для Google и VK и укажите client_id и secret в .env файле.

### Карты
Используется OpenStreetMap через Leaflet.js (бесплатная альтернатива Google Maps).

## Тестирование

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm test
```

## Развертывание в production

### Подготовка

1. Обновите `DEBUG=False` в backend/.env
2. Настройте HTTPS сертификаты в nginx/ssl/
3. Раскомментируйте HTTPS конфигурацию в nginx.conf
4. Настройте ALLOWED_HOSTS и CORS_ALLOWED_ORIGINS

### Бесплатные хостинг опции

**Backend + Database:**
- Railway.app (бесплатный tier)
- Render.com (бесплатный tier)
- Fly.io (бесплатный tier)

**Frontend:**
- Vercel (бесплатно)
- Netlify (бесплатно)
- GitHub Pages (бесплатно)

**Database:**
- ElephantSQL (PostgreSQL, бесплатно до 20MB)
- Supabase (PostgreSQL, бесплатный tier)

## Соответствие ТЗ

Проект полностью соответствует требованиям технического задания:

- ✅ П. 2.1.1 - Управление пользователями (регистрация, авторизация, профиль)
- ✅ П. 2.1.2 - Поиск и просмотр мероприятий
- ✅ П. 2.1.3 - Взаимодействие с мероприятиями (отзывы, рейтинги, отметки)
- ✅ П. 2.1.4 - Система уведомлений (email, настройки)
- ✅ П. 2.1.5 - Администрирование
- ✅ П. 2.2 - Требования к надежности
- ✅ П. 2.3 - Требования к интерфейсу (адаптивный дизайн, цветовая гамма)
- ✅ П. 3.4 - Программная совместимость (технологический стек)

## Лицензия

MIT License

## Поддержка

При возникновении вопросов создавайте Issue в репозитории проекта.