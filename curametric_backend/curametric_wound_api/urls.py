from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .views import UserViewSet, PatientViewSet, WoundViewSet, WoundCareViewSet, UserProfileView, UserCreateViewSet
from .views import GoogleLoginView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'create_user', UserCreateViewSet, basename='create_user')
router.register(r'patients', PatientViewSet)
router.register(r'wounds', WoundViewSet)
router.register(r'woundcares', WoundCareViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("google-login/", GoogleLoginView.as_view(), name="google_login"),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

]
