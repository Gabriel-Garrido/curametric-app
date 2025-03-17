import ftplib
from django.conf import settings
from io import BytesIO

def upload_to_ftp(file, filename, subfolder):
    """
    Sube un archivo al servidor FTP de HostGator y devuelve la URL pública.
    """
    try:
        # Conectar al servidor FTP
        ftp = ftplib.FTP(settings.FTP_HOST, settings.FTP_USER, settings.FTP_PASS)
        ftp.cwd(settings.FTP_MEDIA_PATH)  # Ir a la carpeta de destino

        # Crear subcarpeta si no existe
        for folder in subfolder.split('/'):
            if folder not in ftp.nlst():
                ftp.mkd(folder)
            ftp.cwd(folder)

        # Leer el archivo en bytes
        file_buffer = BytesIO(file.read())

        # Subir el archivo al FTP
        ftp.storbinary(f"STOR {filename}", file_buffer)

        # Cerrar conexión
        ftp.quit()

        return f"{subfolder}/{filename}"  # Retornar la URL relativa

    except Exception as e:
        print("Error subiendo archivo a FTP:", e)
        return None