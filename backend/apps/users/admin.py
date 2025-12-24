from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'city', 'created_at', 'is_staff']
    list_filter = ['is_staff', 'is_active', 'city', 'created_at']
    search_fields = ['username', 'email', 'city']
    ordering = ['-created_at']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': ('city', 'interests', 'avatar')
        }),
        ('Настройки уведомлений', {
            'fields': ('email_notifications', 'push_notifications', 'notification_frequency')
        }),
    )