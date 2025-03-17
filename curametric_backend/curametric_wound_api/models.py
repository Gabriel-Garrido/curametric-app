from django.db import models
from django.contrib.auth.models import User
from datetime import date, datetime
import logging
from .ftp_utils import upload_to_ftp

logger = logging.getLogger(__name__)

class Patient(models.Model):
    first_name = models.CharField(max_length=100, blank=False, null=False, default='no name')
    last_name = models.CharField(max_length=100, blank=False, null=False, default='no last name')
    rut = models.CharField(max_length=12, blank=False, null=False, default='no rut')
    dob = models.DateField(default=date(1900, 1, 1), blank=False, null=False)
    chronic_diseases = models.JSONField(default=dict, blank=True, null=True)
    predispositions = models.JSONField(default=dict, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients_created')
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients_updated')

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

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
        return f'{self.patient.first_name} {self.patient.last_name} - {self.wound_location}'

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
    edema = models.TextField(default='(-)', blank=True, null=True)
    wound_pain = models.TextField(default='(-)', blank=True, null=True)
    surrounding_skin = models.TextField(default='', blank=False, null=False)
    wound_primary_dressing = models.TextField(default='no primary dressing', blank=False, null=False)
    wound_secondary_dressing = models.JSONField(default=dict, blank=True, null=True)
    skin_protection = models.TextField(default='no skin protection', blank=False, null=False)
    wound_cleaning_solution = models.TextField(default='no cleaning solution', blank=False, null=False)
    wound_next_care = models.DateField(default=date(1900, 1, 1), blank=False, null=False)
    wound_care_notes = models.TextField(default='no notes', blank=False, null=False)
    wound_photo = models.ImageField(upload_to='wound_photos', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wound_cares_created')
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wound_cares_updated')
    wound_ia_recomendation = models.JSONField(default=dict, blank=True, null=True)

    def __str__(self):
        return f'{self.wound.patient.first_name} {self.wound.patient.last_name} - {self.wound.wound_location} - {self.care_date}'
    
    def save(self, *args, **kwargs):
        try:
            if self.wound_photo and not self.wound_photo.name.startswith('http'):
                filename = self.wound_photo.name.replace(" ", "_")
                subfolder = f"wound_photos/patient_{self.wound.patient.id}/wound_{self.wound.id}/wound_care_photo_{datetime.now().strftime('%Y%m%d')}"
                file_url = upload_to_ftp(self.wound_photo, filename, subfolder)
                if file_url:
                    self.wound_photo = file_url
                else:
                    raise Exception("Error al subir la imagen a FTP")
            super().save(*args, **kwargs)
            logger.info(f"WoundCare {self.id} guardado correctamente.")
        except Exception as e:
            logger.error(f"Error al guardar WoundCare {self.id}: {e}")
            raise e

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Wound Care'
        verbose_name_plural = 'Wound Cares'