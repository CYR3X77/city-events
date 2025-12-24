from django.contrib import admin
from .models import Notification, PushSubscription

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'is_sent', 'created_at']
    list_filter = ['notification_type', 'is_read', 'is_sent', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    date_hierarchy = 'created_at'


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'endpoint', 'created_at']
    search_fields = ['user__username', 'endpoint']