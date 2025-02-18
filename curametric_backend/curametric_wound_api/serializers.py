from rest_framework import serializers
from .models import Patient, Wound, WoundCare
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class WoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wound
        fields = '__all__'

class WoundCareSerializer(serializers.ModelSerializer):
    class Meta:
        model = WoundCare
        fields = '__all__'
        

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']