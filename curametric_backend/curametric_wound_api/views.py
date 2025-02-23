from rest_framework import viewsets, permissions
from .models import Patient, Wound, WoundCare
from django.contrib.auth.models import User
from .serializers import UserSerializer, PatientSerializer, WoundSerializer, WoundCareSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework_simplejwt.tokens import RefreshToken
import os
import environ
from rest_framework.decorators import action

env = environ.Env()
environ.Env.read_env()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID_WEB")

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        print("Token recibido:", token)

        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            print("Info validada de Google:", idinfo)

            email = idinfo["email"]
            name = idinfo.get("name", "")

            user, created = User.objects.get_or_create(username=email, defaults={"email": email, "first_name": name})
            if created:
                print("Nuevo usuario creado:", user.username)

            refresh = RefreshToken.for_user(user)
            return Response({"jwt": str(refresh.access_token)})

        except Exception as e:
            print("Error al validar el token:", str(e))
            return Response({"error": "Token inválido"}, status=400)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)
     

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Patient.objects.filter(created_by=self.request.user)

class WoundViewSet(viewsets.ModelViewSet):
    queryset = Wound.objects.all()
    serializer_class = WoundSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Wound.objects.filter(created_by=self.request.user)

class WoundCareViewSet(viewsets.ModelViewSet):
    queryset = WoundCare.objects.all()
    serializer_class = WoundCareSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WoundCare.objects.filter(created_by=self.request.user)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # El usuario autenticado llega en request.user,
        # independientemente de si entró con Google o credenciales propias.
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)