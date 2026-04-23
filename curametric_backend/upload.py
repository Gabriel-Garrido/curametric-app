"""
Script standalone para pruebas de conectividad FTP.
Las credenciales deben configurarse como variables de entorno antes de ejecutar:

  export FTP_HOST=...
  export FTP_USER=...
  export FTP_PASS=...
  python upload.py
"""
import ftplib
import os
import traceback

FTP_HOST = os.environ.get("FTP_HOST", "")
FTP_USER = os.environ.get("FTP_USER", "")
FTP_PASS = os.environ.get("FTP_PASS", "")
FTP_DIR = os.environ.get("FTP_MEDIA_PATH", "/media/")

LOCAL_FILE = os.path.join("media", "wound_photos", "test_photo.png")
REMOTE_FILE = "test_upload.jpg"


def upload_file(file=None, filename=None, subfolder=None):
    if file is not None and filename is not None:
        try:
            ftp = ftplib.FTP(FTP_HOST)
            ftp.login(FTP_USER, FTP_PASS)
            ftp.cwd(FTP_DIR)

            for folder in (subfolder or "").split('/'):
                if not folder:
                    continue
                try:
                    ftp.cwd(folder)
                except ftplib.error_perm:
                    ftp.mkd(folder)
                    ftp.cwd(folder)

            ftp.storbinary(f"STOR {filename}", file)
            ftp.quit()
            url = f"{os.environ.get('FTP_BASE_URL', '')}/{subfolder}/{filename}"
            return url
        except Exception as e:
            print(f"Error subiendo archivo a FTP: {e}")
            traceback.print_exc()
            return None

    # Modo de prueba standalone
    if not FTP_HOST or not FTP_USER or not FTP_PASS:
        print("Error: Configurar FTP_HOST, FTP_USER y FTP_PASS como variables de entorno.")
        return

    if not os.path.exists(LOCAL_FILE):
        print(f"Archivo local '{LOCAL_FILE}' no existe.")
        return

    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("Conexión FTP exitosa.")

        for directory in FTP_DIR.split('/'):
            if directory:
                try:
                    ftp.cwd(directory)
                except ftplib.error_perm as e:
                    print(f"No se pudo cambiar al directorio {directory}: {e}")
                    ftp.quit()
                    return

        with open(LOCAL_FILE, "rb") as f:
            ftp.storbinary(f"STOR {REMOTE_FILE}", f)
        print("Archivo subido correctamente.")
        ftp.retrlines("LIST")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    upload_file()
