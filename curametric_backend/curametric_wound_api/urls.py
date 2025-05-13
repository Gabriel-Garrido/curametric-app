from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    PatientViewSet,
    WoundViewSet,
    WoundCareViewSet,
    UserProfileView,
    UserCreateViewSet,
    UploadWoundPhotoView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'create_user', UserCreateViewSet, basename='create_user')
router.register(r'patients', PatientViewSet)
router.register(r'wounds', WoundViewSet)
router.register(r'woundcares', WoundCareViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload-wound-photo/', UploadWoundPhotoView.as_view(), name='upload-wound-photo'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
