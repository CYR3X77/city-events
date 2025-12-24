from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from apps.events.views import EventViewSet, CategoryViewSet, UserEventInteractionViewSet
from apps.reviews.views import ReviewViewSet
from apps.notifications.views import NotificationViewSet
from apps.users.views import UserProfileViewSet

# Router для API
router = routers.DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'interactions', UserEventInteractionViewSet, basename='interaction')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'users', UserProfileViewSet, basename='user')

# Swagger документация
schema_view = get_schema_view(
    openapi.Info(
        title="City Events API",
        default_version='v1',
        description="API информационной системы планирования городских мероприятий и событий",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="support@cityevents.ru"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API
    path('api/v1/', include(router.urls)),
    
    # Auth endpoints
    path('api/v1/auth/', include('dj_rest_auth.urls')),
    path('api/v1/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/v1/auth/social/', include('allauth.socialaccount.urls')),
    
    # Swagger/OpenAPI документация
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Статика и медиа в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)