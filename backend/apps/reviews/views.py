from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Review.objects.select_related('user', 'event')
        
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='approved')
        
        event_id = self.request.query_params.get('event')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='pending')