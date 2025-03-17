from rest_framework import serializers
from .models import Patient, Wound, WoundCare
from django.contrib.auth.models import User

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class WoundSerializer(serializers.ModelSerializer):
    patientData = PatientSerializer(read_only=True ,source='patient')
    
    class Meta:
        model = Wound
        fields = '__all__'

class WoundCareSerializer(serializers.ModelSerializer):
    woundData = WoundSerializer(read_only=True ,source='wound')

    class Meta:
        model = WoundCare
        fields = '__all__'
        

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user