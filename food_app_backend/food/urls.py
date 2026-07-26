from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MenuListView, CheckoutView, OrderHistoryView, 
    KitchenOrderQueueView, UpdateOrderStatusView, 
    AdminAllOrdersView, AdminFinancialsView,
    MenuManagementViewSet, CategoryViewSet
)

router = DefaultRouter()
router.register(r'menu-manage', MenuManagementViewSet, basename='menu-manage')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'categories/manage', CategoryViewSet, basename='category-manage')

urlpatterns = [
    # Menu & Checkout
    path('menu/', MenuListView.as_view(), name='menu-list'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    
    # ---------------------------------------------------------
    # UPDATED ROUTES TO MATCH FRONTEND EXACTLY
    # ---------------------------------------------------------
    path('orders/', OrderHistoryView.as_view(), name='order-history'),
    path('kitchen/orders/', KitchenOrderQueueView.as_view(), name='kitchen-queue'),
    # ---------------------------------------------------------

    path('orders/<int:pk>/status/', UpdateOrderStatusView.as_view(), name='update-order-status'),
    path('orders/admin/all/', AdminAllOrdersView.as_view(), name='admin-all-orders'),
    
    # Reports & Financials API
    path('admin/reports/', AdminFinancialsView.as_view(), name='admin-reports'),
    
    # Router endpoints (categories & menu-manage)
    path('', include(router.urls)),
]