/**
 * Formatea una URL de descarga reemplazando host.docker.internal por node.sofmar.com.py
 * y usa un proxy para evitar problemas de SSL
 * @param downloadUrl - URL de descarga que contiene host.docker.internal
 * @returns URL formateada con node.sofmar.com.py usando HTTP
 */
export const formatFileUrl = (downloadUrl: string): string => {
  if (!downloadUrl) return downloadUrl;
  
  // Reemplazar host.docker.internal por node.sofmar.com.py
  const replacedUrl = downloadUrl.replace('host.docker.internal', 'node.sofmar.com.py');
  
  // Si la URL ya es HTTP, mantenerla así
  if (replacedUrl.startsWith('http://')) {
    return replacedUrl;
  }
  
  // Si es HTTPS, convertir a HTTP
  return replacedUrl;
};