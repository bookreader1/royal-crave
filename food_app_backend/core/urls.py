from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter # 1. Added this import!
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from food.views import MenuManagementViewSet, CategoryViewSet

# 2. Set up the router OUTSIDE the urlpatterns list
router = DefaultRouter()
router.register(r'categories/manage', CategoryViewSet, basename='category-manage')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('food.urls')),
    
    # 3. Add the router URLs to the paths
    path('api/', include(router.urls)), 
    
    # JWT Authentication Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Management Endpoints
    path('api/users/', include('users.urls')), 
]