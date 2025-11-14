# users/serializers.py
from rest_framework import serializers
from .models import User
from django.contrib.auth import update_session_auth_hash
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import update_last_login

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    # formatted, read-only datetime fields (allow_null True to avoid errors)
    last_login = serializers.DateTimeField(read_only=True, format="%m/%d/%Y %H:%M", allow_null=True)
    date_joined = serializers.DateTimeField(read_only=True, format="%m/%d/%Y %H:%M", allow_null=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone',
            'role',
            'department',
            'status',
            'is_active',
            'is_staff',
            'last_login',
            'date_joined',
        ]
        read_only_fields = ('id', 'last_login', 'date_joined')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# Custom SimpleJWT serializer that updates last_login on successful token obtain
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # update Django last_login
        update_last_login(None, self.user)
        return data
