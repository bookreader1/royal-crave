from rest_framework import generics, permissions, viewsets
from django.db.models import Prefetch
from .models import MenuItem, Category, Order
from .serializers import MenuItemSerializer, CategorySerializer, OrderSerializer
from users.serializers import UserSerializer 
from django.utils import timezone

class MenuListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.is_superuser or getattr(user, 'role', '') in ['admin', 'kitchen']):
            return Category.objects.prefetch_related('items').all()
        
        return Category.objects.prefetch_related(
            Prefetch(
                'items',
                queryset=MenuItem.objects.filter(is_available=True)
            )
        ).all()

class CheckoutView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by('-created_at')

class KitchenOrderQueueView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.exclude(status='Delivered').order_by('created_at')

class UpdateOrderStatusView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        new_status = self.request.data.get('status')
        
        if new_status:
            # Prepare a dictionary of fields to update
            update_data = {'status': new_status}
            
            # Record exact timestamps based on the status
            if new_status == 'Preparing':
                update_data['preparing_at'] = timezone.now()
            elif new_status in ['Delivered', 'Completed']:
                update_data['delivered_at'] = timezone.now()
                
            # Save the new status along with the timestamps
            serializer.save(**update_data)
        else:
            serializer.save()

class MenuManagementViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdminAllOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser or getattr(user, 'role', '') == 'admin':
            return Order.objects.all().order_by('-created_at')
        return Order.objects.none()

# Add this at the bottom of your views.py

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]    