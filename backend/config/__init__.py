# config/__init__.py
# Это гарантирует, что Celery приложение всегда импортируется при запуске Django

from .celery import app as celery_app

__all__ = ('celery_app',)