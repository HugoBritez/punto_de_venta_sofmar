import { ContactoCRMModel } from "@/features/CRM/types/contactos.type";

export const getContactName = (
  contactos: ContactoCRMModel[], 
  telefono: string
): string => {
  if (!telefono?.trim()) return telefono;
  if (!contactos?.length) return telefono;

  // Normalizar teléfono de búsqueda
  const telefonoNormalizado = normalizarTelefonoParaguay(telefono);
  
  // Buscar contacto con teléfono coincidente
  const contactoEncontrado = contactos.find(contacto => {
    const telefonoContacto = contacto.telefono;
    if (!telefonoContacto) return false;
    
    return normalizarTelefonoParaguay(telefonoContacto) === telefonoNormalizado;
  });

  return contactoEncontrado?.nombre || telefono;
};

/**
 * Normaliza números de teléfono paraguayos a formato estándar
 * Maneja formatos: +595982373124, 5959823724, 0982373124, etc.
 * @param telefono - Número a normalizar
 * @returns Número normalizado (solo los últimos 9 dígitos del móvil)
 */
const normalizarTelefonoParaguay = (telefono: string): string => {
  // Remover espacios, guiones, paréntesis y otros caracteres
  let numeroLimpio = telefono.replace(/[\s\-\(\)\+]/g, '');
  
  // Remover caracteres no numéricos
  numeroLimpio = numeroLimpio.replace(/\D/g, '');
  
  // Casos específicos para Paraguay
  if (numeroLimpio.startsWith('595')) {
    // Formato internacional: +595982373124 -> 982373124
    return numeroLimpio.substring(3);
  }
  
  if (numeroLimpio.startsWith('0')) {
    // Formato nacional: 0982373124 -> 982373124
    return numeroLimpio.substring(1);
  }
  
  // Si ya está en formato correcto (9 dígitos empezando con 9)
  if (numeroLimpio.length === 9 && numeroLimpio.startsWith('9')) {
    return numeroLimpio;
  }
  
  // Para otros casos, retornar los últimos 9 dígitos si hay más de 9
  if (numeroLimpio.length > 9) {
    return numeroLimpio.slice(-9);
  }
  
  return numeroLimpio;
};