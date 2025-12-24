from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, CategoryViewSet, UserEventInteractionViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'interactions', UserEventInteractionViewSet, basename='interaction')

urlpatterns = router.urls