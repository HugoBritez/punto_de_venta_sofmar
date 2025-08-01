export type NotificationPermission = 'granted' | 'denied' | 'default';

class NotificationService {
  constructor() {
    // Solicitar permisos al inicializar
    this.requestPermissions();
    
    // Debug: mostrar estado de permisos
    console.log('🔔 NotificationService inicializado');
    console.log('🔔 Estado de permisos:', this.getPermissionStatus());
  }

  // Gestión de permisos
  public async requestPermissions(): Promise<NotificationPermission> {
    console.log('🔔 Solicitando permisos de notificación...');
    
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permisos ya concedidos');
      return 'granted';
    }

    if (Notification.permission === 'default') {
      console.log('❓ Solicitando permisos al usuario...');
      const permission = await Notification.requestPermission();
      console.log('📝 Respuesta del usuario:', permission);
      return permission as NotificationPermission;
    }

    console.log('❌ Permisos denegados previamente');
    return Notification.permission as NotificationPermission;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission as NotificationPermission;
  }

  // Notificación del navegador
  private showBrowserNotification(title: string, message: string, chatId?: string): void {
    console.log('🔔 Intentando mostrar notificación del navegador...');
    console.log('🔔 Título:', title);
    console.log('🔔 Mensaje:', message);
    console.log('🔔 Estado de permisos:', this.getPermissionStatus());
    
    if (this.getPermissionStatus() !== 'granted') {
      console.log('⚠️ Permisos de notificación no concedidos');
      console.log('⚠️ Para habilitar: Ve a configuración del navegador > Notificaciones > Permitir para este sitio');
      return;
    }

    try {
      console.log('✅ Creando notificación...');
      const notification = new Notification(title, {
        body: message,
        icon: '/icon-192x192.png', // ✅ Usar ícono que existe
        badge: '/icon-192x192.png', // ✅ Usar ícono que existe
        tag: chatId || 'whatsapp-message',
        requireInteraction: false,
        silent: false
      });

      console.log('✅ Notificación creada exitosamente');

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
        console.log('🔔 Notificación cerrada automáticamente');
      }, 5000);

      // Manejar clic en la notificación
      notification.onclick = () => {
        console.log('👆 Click en notificación');
        window.focus();
        notification.close();
        
        // Emit event para abrir el chat específico
        if (chatId) {
          window.dispatchEvent(new CustomEvent('openChat', { 
            detail: { chatId } 
          }));
        }
      };

    } catch (error) {
      console.error('❌ Error al crear notificación:', error);
    }
  }

  // Método principal para mensajes
  public showMessageNotification(chatId: string, contactName: string, message: string): void {
    console.log('🚀 showMessageNotification llamado:');
    console.log('📱 Chat ID:', chatId);
    console.log('👤 Contacto:', contactName);
    console.log('💬 Mensaje:', message);
    
    const windowHidden = document.hidden;
    const windowHasFocus = document.hasFocus();
    const shouldShow = windowHidden || !windowHasFocus;
    
    console.log('🪟 Estado de ventana:');
    console.log('  - hidden:', windowHidden);
    console.log('  - hasFocus:', windowHasFocus);
    console.log('  - shouldShow:', shouldShow);
    
    // 🎯 TEMPORAL: Mostrar SIEMPRE para debug (quitar después)
    const title = `Nuevo mensaje de ${contactName}`;
    const body = message.length > 100 ? message.substring(0, 100) + '...' : message;
    
    console.log('🔔 Forzando notificación para debug...');
    this.showBrowserNotification(title, body, chatId);
  }

  // Método para probar notificaciones manualmente
  public testNotification(): void {
    console.log('🧪 Probando notificación...');
    this.showMessageNotification('test-chat', 'Usuario de Prueba', 'Este es un mensaje de prueba');
  }
}

// Instancia singleton
export const notificationService = new NotificationService();

// 🎯 DEBUG: Exponer en window para pruebas manuales
(window as any).notificationService = notificationService;
