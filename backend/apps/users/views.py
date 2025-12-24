from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CustomUser
from .serializers import UserSerializer, UserProfileUpdateSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CustomUser.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = UserProfileUpdateSerializer(
                request.user, 
                data=request.data, 
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)