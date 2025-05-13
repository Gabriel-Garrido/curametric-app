from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Patient, Wound, WoundCare
from django.contrib.auth.models import User
from .serializers import UserSerializer, PatientSerializer, WoundSerializer, WoundCareSerializer, UserCreateSerializer
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

from curametric_backend.upload import upload_file

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

class UserCreateViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_user(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserCreateSerializer(user).data)
        return Response(serializer.errors, status=400)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Patient.objects.filter(created_by=self.request.user)

class WoundViewSet(viewsets.ModelViewSet):
    queryset = Wound.objects.all()
    serializer_class = WoundSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wound.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

class WoundCareViewSet(viewsets.ModelViewSet):
    queryset = WoundCare.objects.all()
    serializer_class = WoundCareSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = WoundCare.objects.filter(created_by=self.request.user)
        wound_id = self.request.query_params.get('wound', None)
        if wound_id is not None:
            queryset = queryset.filter(wound_id=wound_id)
        return queryset
    
    def perform_create(self, serializer):
        try:
            serializer.save(created_by=self.request.user, updated_by=self.request.user)
        except Exception as e:
            print(f"Error al guardar WoundCare: {e}")
            raise e
    

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

from rest_framework import status
from curametric_backend.upload import upload_file

class UploadWoundPhotoView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Obtener el archivo de la solicitud
            wound_care_id = request.data.get('wound_care_id')
            file = request.FILES.get('file')

            if not wound_care_id or not file:
                return Response({"error": "Faltan parámetros obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

            # Obtener el WoundCare correspondiente
            wound_care = WoundCare.objects.get(id=wound_care_id)

            # Subir el archivo al FTP
            extension = os.path.splitext(file.name)[1]
            filename = f"wound_care_photo_{wound_care_id}{extension}"
            subfolder = f"wound_photos/patient_{wound_care.wound.patient.id}/wound_{wound_care.wound.id}"
            file_url = upload_file(file, filename, subfolder)

            if not file_url:
                return Response({"error": "Error al subir la imagen al servidor FTP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Guardar la URL en el modelo
            wound_care.wound_photo = file_url
            wound_care.save()

            return Response({"message": "Imagen subida correctamente.", "url": file_url}, status=status.HTTP_200_OK)
        except WoundCare.DoesNotExist:
            return Response({"error": "WoundCare no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)