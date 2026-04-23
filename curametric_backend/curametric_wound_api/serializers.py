from rest_framework import serializers
from .models import Patient, Wound, WoundCare
from django.contrib.auth.models import User


class PatientSerializer(serializers.ModelSerializer):
    birth_date = serializers.DateField(source='dob')

    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'rut', 'birth_date',
            'chronic_diseases', 'predispositions',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]


class WoundSerializer(serializers.ModelSerializer):
    patientData = PatientSerializer(read_only=True, source='patient')

    class Meta:
        model = Wound
        fields = '__all__'


class WoundCareSerializer(serializers.ModelSerializer):
    woundData = WoundSerializer(read_only=True, source='wound')

    # Aliases: frontend names → model fields
    width = serializers.FloatField(source='wound_width', default=0)
    height = serializers.FloatField(source='wound_height', default=0)
    depth = serializers.FloatField(source='wound_depth', default=0)
    borders = serializers.CharField(source='wound_borders', allow_blank=True, required=False, default='')
    exudate_amount = serializers.CharField(source='wound_exudate_quantity', default='')
    exudate_type = serializers.CharField(source='wound_exudate_quality', default='')
    granulation_tissue = serializers.FloatField(source='wound_granulation_tissue', default=0)
    slough = serializers.FloatField(source='wound_sloughed_tissue', default=0)
    necrotic_tissue = serializers.FloatField(source='wound_necrotic_tissue', default=0)
    debridement = serializers.BooleanField(source='wound_debridement', default=False)
    primary_dressing = serializers.CharField(source='wound_primary_dressing', allow_blank=True, required=False, default='')
    secondary_dressing = serializers.CharField(source='wound_secondary_dressing', allow_blank=True, required=False, default='')
    next_care_date = serializers.DateField(source='wound_next_care', required=False)
    care_notes = serializers.CharField(source='wound_care_notes', allow_blank=True, required=False, default='')

    class Meta:
        model = WoundCare
        fields = [
            'id', 'wound', 'woundData', 'care_date',
            'width', 'height', 'depth', 'borders',
            'granulation_tissue', 'slough', 'necrotic_tissue',
            'exudate_amount', 'exudate_type',
            'edema', 'wound_pain', 'surrounding_skin',
            'debridement', 'primary_dressing', 'secondary_dressing',
            'skin_protection', 'wound_cleaning_solution',
            'next_care_date', 'care_notes',
            'wound_photo', 'wound_ia_recomendation',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]


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
