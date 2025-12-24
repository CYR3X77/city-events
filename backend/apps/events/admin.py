from django.contrib import admin
from .models import Event, Category, UserEventInteraction

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'city', 'start_date', 'status', 'views_count', 'created_at']
    list_filter = ['status', 'category', 'city', 'is_featured', 'is_free', 'created_at']
    search_fields = ['title', 'description', 'organizer', 'city']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'start_date'
    ordering = ['-created_at']


@admin.register(UserEventInteraction)
class UserEventInteractionAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'interaction_type', 'created_at']
    list_filter = ['interaction_type', 'created_at']
    search_fields = ['user__username', 'event__title']