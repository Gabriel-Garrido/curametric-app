import ftplib
import os
import traceback

# Configuración del servidor FTP
FTP_HOST = "shared20.hostgator.cl"
FTP_USER = "curametric@curametric.webcobra.cl"
FTP_PASS = "Gabrocode.43"
FTP_DIR = "/media/"  # Ajusta esta ruta según sea necesario

# Archivo local a subir
LOCAL_FILE = os.path.join("media", "wound_photos", "Captura_de_pantalla_2025-02-12_161054.png")
REMOTE_FILE = "local.jpg"

def upload_file():
    try:
        # Verificar si el archivo local existe
        print("Verificando si el archivo local existe...")
        if not os.path.exists(LOCAL_FILE):
            print(f"El archivo local '{LOCAL_FILE}' no existe.")
            return

        # Conectar al servidor FTP usando FTP simple
        print("Conectando al servidor FTP usando FTP simple...")
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("Conexión FTP exitosa.")

        # Verificar y cambiar al directorio correcto
        print(f"Navegando al directorio remoto: {FTP_DIR}")
        directories = FTP_DIR.split('/')
        for directory in directories:
            if directory:
                try:
                    ftp.cwd(directory)
                    print(f"Entrando al directorio: {directory}")
                except ftplib.error_perm as e:
                    print(f"No se pudo cambiar al directorio {directory}: {e}")
                    ftp.quit()
                    return

        # Subir el archivo
        print(f"Subiendo el archivo '{LOCAL_FILE}' como '{REMOTE_FILE}'...")
        with open(LOCAL_FILE, "rb") as file:
            ftp.storbinary(f"STOR {REMOTE_FILE}", file)
        print("Archivo subido correctamente.")

        # Listar archivos en el directorio remoto para verificar la subida
        print("Listando archivos en el directorio remoto:")
        ftp.retrlines("LIST")

        # Cerrar la conexión
        ftp.quit()
        print("Conexión cerrada.")
    except FileNotFoundError:
        print(f"Archivo no encontrado: {LOCAL_FILE}")
    except ftplib.error_perm as e:
        print(f"Permiso denegado: {e}")
    except ftplib.error_temp as e:
        print(f"Error temporal del servidor FTP: {e}")
    except ftplib.error_proto as e:
        print(f"Error de protocolo FTP: {e}")
    except ftplib.all_errors as e:
        print(f"Error inesperado al subir el archivo: {e}")
        print("Detalles del error:")
        traceback.print_exc()

if __name__ == "__main__":
    upload_file()