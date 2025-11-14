from django.contrib import admin
from django.urls import path, include

from users.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),

    # User app endpoints
    path('api/users/', include('users.urls')),

    # JWT Authentication endpoints
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]
