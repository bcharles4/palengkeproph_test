from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=50)
    department = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return f"{self.username} ({self.role})"
    
    # Add this method to fix the admin error
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    full_name.short_description = 'Full Name'  # Optional: Sets column header in admin

    class meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'   

