from django.contrib import admin
from django.urls import path, include, re_path
from users.views import CustomTokenObtainPairView, ReactAppView  # Add ReactAppView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # User app endpoints
    path('api/', include('users.urls')),  # This now includes /api/register/ and /api/users/

    # JWT Authentication endpoints
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Serve React app for all other routes (must be last)
    re_path(r'^.*$', ReactAppView.as_view(), name='react-app'),
]