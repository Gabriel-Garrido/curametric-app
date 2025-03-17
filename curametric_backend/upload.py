import ftplib
import os

# Configuración del servidor FTP
FTP_HOST = "ftp.webcobra.cl"
FTP_USER = "curametric@curametric.webcobra.cl"
FTP_PASS = "Gabrocode.43"
FTP_DIR = "/media/"  # Ajusta esta ruta según sea necesario

# Archivo local a subir
LOCAL_FILE = "media\wound_photos\Captura_de_pantalla_2025-02-12_161054.png"
REMOTE_FILE = "local.jpg"

def upload_file():
    try:
        # Conectar al servidor FTP
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        
        # Verificar y cambiar al directorio correcto
        directories = FTP_DIR.split('/')
        for directory in directories:
            if directory:
                try:
                    ftp.cwd(directory)
                except ftplib.error_perm as e:
                    print(f"No se pudo cambiar al directorio {directory}: {e}")
                    return
        
        # Subir el archivo
        with open(LOCAL_FILE, "rb") as file:
            ftp.storbinary(f"STOR {REMOTE_FILE}", file)

        # Listar archivos en el directorio remoto para verificar la subida
        ftp.retrlines("LIST")

        # Cerrar la conexión
        ftp.quit()
        print("Archivo subido correctamente.")
    except ftplib.all_errors as e:
        print(f"Error al subir el archivo: {e}")

if __name__ == "__main__":
    upload_file()