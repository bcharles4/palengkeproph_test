from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('id', 'username', 'full_name', 'email', 'role', 'department', 'status', 'is_staff', 'is_active')
    list_filter = ('role', 'status', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'full_name', 'role')
    ordering = ('id',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'email', 'phone', 'department', 'role')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Status', {'fields': ('status',)}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'status', 'is_staff', 'is_active'),
        }),
    )
