from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import Patient, Wound, WoundCare

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'last_name', 'rut','dob', 'created_at', 'updated_at', 'created_by', 'updated_by')
    search_fields = ('name', 'last_name')
    list_filter = ('created_at', 'updated_at')

@admin.register(Wound)
class WoundAdmin(admin.ModelAdmin):
    list_display = ('patient', 'wound_location', 'wound_origin', 'wound_origin_date', 'created_at', 'updated_at', 'created_by', 'updated_by')
    search_fields = ('patient__name', 'patient__last_name', 'wound_location')
    list_filter = ('created_at', 'updated_at')

@admin.register(WoundCare)
class WoundCareAdmin(admin.ModelAdmin):
    list_display = ('wound', 'care_date', 'wound_heigh', 'wound_width', 'wound_depth', 'created_at', 'updated_at', 'created_by', 'updated_by')
    search_fields = ('wound__patient__name', 'wound__patient__last_name', 'wound__wound_location')
    list_filter = ('created_at', 'updated_at')