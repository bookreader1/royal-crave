from rest_framework import generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Prefetch, Sum, Count, Q
from django.utils import timezone
from .models import MenuItem, Category, Order
from .serializers import MenuItemSerializer, CategorySerializer, OrderSerializer
from users.serializers import UserSerializer 

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
            update_data = {'status': new_status}
            
            if new_status == 'Preparing':
                update_data['preparing_at'] = timezone.now()
            elif new_status in ['Delivered', 'Completed']:
                update_data['delivered_at'] = timezone.now()
                
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

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

# --- DATABASE-LEVEL FINANCIAL & REPORTING API ---
class AdminFinancialsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not (user.is_staff or user.is_superuser or getattr(user, 'role', '') == 'admin'):
            return Response({"detail": "Permission denied. Admin access required."}, status=403)

        today = timezone.now().date()

        # 1. Total revenue calculated strictly from 'Delivered' orders in DB
        total_revenue = Order.objects.filter(status='Delivered').aggregate(
            revenue=Sum('total_amount')
        )['revenue'] or 0.00

        # 2. Today's revenue
        today_revenue = Order.objects.filter(
            status='Delivered', 
            created_at__date=today
        ).aggregate(revenue=Sum('total_amount'))['revenue'] or 0.00

        # 3. Exact counts for all order lifecycle states
        order_stats = Order.objects.aggregate(
            total_orders=Count('id'),
            pending=Count('id', filter=Q(status='Pending')),
            preparing=Count('id', filter=Q(status='Preparing')),
            out_for_delivery=Count('id', filter=Q(status='Out for Delivery')),
            delivered=Count('id', filter=Q(status='Delivered'))
        )

        return Response({
            "financials": {
                "total_revenue_all_time": float(total_revenue),
                "revenue_today": float(today_revenue),
            },
            "order_lifecycle": order_stats
        })