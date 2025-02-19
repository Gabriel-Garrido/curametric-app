from django.db import models
from django.contrib.auth.models import User
from datetime import date

class Patient(models.Model):
    name = models.CharField(max_length=100, blank=False, null=False, default='no name')
    last_name = models.CharField(max_length=100, blank=False, null=False, default='no last name')
    rut = models.CharField(max_length=12, blank=False, null=False, default='no rut')
    dob = models.DateField(default=date(1900, 1, 1), blank=False, null=False)
    cronic_diseases = models.JSONField(default=dict, blank=True, null=True)
    predispositions = models.JSONField(default=dict, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients_created')
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients_updated')

    def __str__(self):
        return f'{self.name} {self.last_name}'

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'

class Wound(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    wound_location = models.CharField(max_length=100, blank=False, null=False, default='no wound location')
    wound_origin = models.CharField(max_length=100, blank=False, null=False, default='no wound cause')
    wound_origin_date = models.DateField(default=date(1900, 1, 1), blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wounds_created')
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wounds_updated')

    def __str__(self):
        return f'{self.patient.name} {self.patient.last_name} - {self.wound_location}'

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Wound'
        verbose_name_plural = 'Wounds'

class WoundCare(models.Model):
    wound = models.ForeignKey(Wound, on_delete=models.CASCADE)
    care_date = models.DateField(default=date(1900, 1, 1), blank=False, null=False)
    wound_heigh = models.FloatField(default=0, blank=False, null=False)
    wound_width = models.FloatField(default=0, blank=False, null=False)
    wound_depth = models.FloatField(default=0, blank=False, null=False)
    wound_necrotic_tissue = models.FloatField(default=0, blank=False, null=False)
    wound_sloughed_tissue = models.FloatField(default=0, blank=False, null=False)
    wound_granulation_tissue = models.FloatField(default=0, blank=False, null=False)
    wound_exudate_quantity = models.TextField(default='no exudate quantity', blank=False, null=False)
    wound_exudate_quality = models.TextField(default='no exudate quality', blank=False, null=False)
    wound_debridement = models.BooleanField(default=False, blank=False, null=False)
    wound_primary_dressing = models.TextField(default='no primary dressing', blank=False, null=False)
    wound_secondary_dressing = models.JSONField(default=dict, blank=True, null=True)
    wound_next_care = models.DateField(default=date(1900, 1, 1), blank=False, null=False)
    wound_care_notes = models.TextField(default='no notes', blank=False, null=False)
    wound_photo = models.ImageField(upload_to='wound_photos', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wound_cares_created')
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wound_cares_updated')

    def __str__(self):
        return f'{self.wound.patient.name} {self.wound.patient.last_name} - {self.wound.wound_location} - {self.care_date}'

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Wound Care'
        verbose_name_plural = 'Wound Cares'
