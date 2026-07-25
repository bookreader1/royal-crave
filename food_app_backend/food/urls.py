from django.urls import path
from .views import CategoryViewSet # Make sure to import it!

# If you already have a router, just add this line:
# router.register(r'categories/manage', CategoryViewSet, basename='category-manage')
from .views import (
    MenuListView, 
    CheckoutView, 
    OrderHistoryView, 
    KitchenOrderQueueView, 
    MenuManagementViewSet,
    UpdateOrderStatusView,
    AdminAllOrdersView # <-- Make sure this is imported!
)

urlpatterns = [
    path('menu/', MenuListView.as_view(), name='menu-list'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/', OrderHistoryView.as_view(), name='order-history'),
    path('kitchen/orders/', KitchenOrderQueueView.as_view(), name='kitchen-orders'),
    
    # NEW: This is the URL your React Admin Dashboard is trying to fetch from!
    path('admin/orders/', AdminAllOrdersView.as_view(), name='admin-all-orders'), 
    
    path('orders/<int:pk>/status/', UpdateOrderStatusView.as_view(), name='update-order-status'),
    path('menu/manage/', MenuManagementViewSet.as_view({'get': 'list', 'post': 'create'}), name='menu-manage-list'),
    path('menu/manage/<int:pk>/', MenuManagementViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='menu-manage-detail'),
]
