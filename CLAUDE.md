# CuraMetric App

Aplicación móvil y web para el registro y seguimiento de curaciones de heridas con IA. Construida con React Native (Expo) en el frontend y Django REST Framework en el backend.

## Arquitectura

```
curametric-app/
├── curametric-app/          # Frontend React Native + Expo
│   ├── app/                 # Rutas (Expo Router file-based routing)
│   │   ├── login/           # LoginScreen, CreateAccount
│   │   ├── patient/         # AddWound, AddWoundCare, WoundCareHistory
│   │   └── (tabs)/          # PatientList (tab principal)
│   ├── components/          # Componentes reutilizables
│   │   └── AddWoundCare/    # Secciones del formulario de curación
│   ├── redux/               # Estado global (authSlice, store)
│   ├── utils/               # AuthContext, authUtils
│   └── constant/            # Colors (design tokens)
└── curametric_backend/      # Backend Django REST
    ├── core/                # settings.py, urls.py raíz
    ├── curametric_wound_api/ # App principal: models, views, serializers, urls
    └── upload.py            # Script FTP standalone (no usar en producción)
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Mobile/Web | React Native 0.76 + Expo 52 |
| Navegación | Expo Router (file-based) |
| Estado | Redux Toolkit + React-Redux |
| HTTP | Axios |
| Auth | Google OAuth 2.0 + JWT (SimpleJWT) |
| Backend | Django 5.1 + Django REST Framework 3.15 |
| Base de datos | PostgreSQL (prod) / SQLite (dev) |
| Archivos | FTP HostGator via django-storages |
| IA | OpenAI GPT-3.5 Turbo (recomendaciones de curación) |

## Desarrollo

### Frontend

```bash
cd curametric-app
npm install
npm start          # Expo dev server
npm run web        # Solo web
npm run android    # Android
npm run ios        # iOS
```

Variables de entorno (`.env.local`):
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=...
EXPO_PUBLIC_OPENAI_API_KEY=...
```

### Backend

```bash
cd curametric_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Variables de entorno (`.env`):
```
DEBUG=True
SECRET_KEY=...
ALLOWED_HOSTS_DEV=localhost,127.0.0.1
DATABASE_URL=postgres://...          # solo prod
ALLOWED_HOSTS_DEPLOY=...             # solo prod
CORS_ORIGIN_WHITELIST_DEPLOY=...     # solo prod
CSRF_TRUSTED_ORIGIN_DEPLOY=...       # solo prod
GOOGLE_CLIENT_ID_WEB=...
OPENAI_API_KEY=...
FTP_HOST=...
FTP_USER=...
FTP_PASS=...
FTP_MEDIA_PATH=/media/
FTP_BASE_URL=https://...
```

## API Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/token/` | Login manual (usuario/contraseña) → `{access, refresh}` | No |
| POST | `/api/token/refresh/` | Renovar access token | No |
| POST | `/api/google-login/` | Login con Google OAuth | No |
| POST | `/api/create_user/create_user/` | Registro de usuario | No |
| GET | `/api/users/me/` | Perfil del usuario autenticado | Sí |
| GET/POST | `/api/patients/` | Listar/crear pacientes | Sí |
| GET/PUT/DELETE | `/api/patients/{id}/` | CRUD paciente | Sí |
| GET/POST | `/api/wounds/` | Listar/crear heridas | Sí |
| GET/POST | `/api/woundcares/` | Listar/crear curaciones (`?wound=<id>` para filtrar) | Sí |
| POST | `/api/upload-wound-photo/` | Subir foto al FTP | Sí |
| GET | `/api/profile/` | Perfil usuario | Sí |

## Modelos de datos

### Patient
- `first_name`, `last_name`, `rut` (formato chileno), `dob` (fecha nacimiento)
- `chronic_diseases` (JSONField), `predispositions` (JSONField)
- `created_by`, `updated_by` (FK a User)

### Wound
- `patient` (FK), `wound_location`, `wound_origin`, `wound_origin_date`
- `created_by`, `updated_by`

### WoundCare
- `wound` (FK), `care_date`
- Mediciones: `wound_width`, `wound_height`, `wound_depth`
- Tejidos: `wound_granulation_tissue`, `wound_sloughed_tissue`, `wound_necrotic_tissue`
- Estado: `wound_exudate_quantity`, `wound_exudate_quality`, `edema`, `wound_pain`, `surrounding_skin`, `wound_borders`, `wound_debridement`
- Tratamiento: `wound_primary_dressing`, `wound_secondary_dressing`, `skin_protection`, `wound_cleaning_solution`
- Seguimiento: `wound_next_care`, `wound_care_notes`, `wound_photo`
- IA: `wound_ia_recomendation` (JSONField)

## Mapeo Frontend → Backend (WoundCare)

El serializer traduce los nombres del frontend a los campos del modelo:

| Frontend envía | Campo en modelo |
|---------------|----------------|
| `width` | `wound_width` |
| `height` | `wound_height` |
| `depth` | `wound_depth` |
| `borders` | `wound_borders` |
| `exudate_amount` | `wound_exudate_quantity` |
| `exudate_type` | `wound_exudate_quality` |
| `granulation_tissue` | `wound_granulation_tissue` |
| `slough` | `wound_sloughed_tissue` |
| `necrotic_tissue` | `wound_necrotic_tissue` |
| `debridement` | `wound_debridement` |
| `primary_dressing` | `wound_primary_dressing` |
| `secondary_dressing` | `wound_secondary_dressing` |
| `next_care_date` | `wound_next_care` |
| `care_notes` | `wound_care_notes` |

## Flujo de autenticación

1. Login manual: `POST /api/token/` con `{username, password}` → `{access, refresh}`
2. Login Google: `promptAsync()` → ID token → `POST /api/google-login/` → `{jwt}`
3. Token almacenado en AsyncStorage y Redux
4. Todas las peticiones protegidas llevan `Authorization: Bearer <token>`

## Notas de seguridad

- Las credenciales FTP deben estar en variables de entorno (`.env`), nunca en código
- `CORS_ALLOW_ALL_ORIGINS = True` solo es válido en desarrollo; en producción usar whitelist
- La API key de OpenAI en el frontend (`EXPO_PUBLIC_OPENAI_API_KEY`) es accesible en el cliente; considerar mover las llamadas a IA al backend en producción

## Flujo de una curación

1. Seleccionar paciente → Ver heridas → Agregar curación
2. Formulario de 4 secciones con barra de progreso:
   - Sección 1: Medidas de la herida
   - Sección 2: Composición de tejidos (granulación/esfacelado/necrótico, suma ≤ 100%)
   - Sección 3: Condiciones circundantes
   - Sección 4: Detalles del tratamiento + foto
3. Opcionalmente consultar recomendación IA antes de guardar
4. Al guardar: POST a `/api/woundcares/`, luego (si hay foto) POST a `/api/upload-wound-photo/`
