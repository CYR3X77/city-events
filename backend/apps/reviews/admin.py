from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'rating', 'status', 'created_at']
    list_filter = ['status', 'rating', 'created_at']
    search_fields = ['user__username', 'event__title', 'text']
    date_hierarchy = 'created_at'
    
    actions = ['approve_reviews', 'reject_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(status='approved')
    approve_reviews.short_description = "Одобрить выбранные отзывы"
    
    def reject_reviews(self, request, queryset):
        queryset.update(status='rejected')
    reject_reviews.short_description = "Отклонить выбранные отзывы"