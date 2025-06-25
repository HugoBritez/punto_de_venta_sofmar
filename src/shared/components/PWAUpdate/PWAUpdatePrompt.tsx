import React, { useEffect, useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

const PWAUpdatePrompt: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Escuchar mensajes del service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            window.location.reload();
          }
        });
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = async () => {
    if (registration && registration.waiting) {
      setIsUpdating(true);
      
      try {
        // Enviar mensaje al service worker para que se active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        
        // El reload se hará automáticamente cuando el service worker responda
      } catch (error) {
        console.error('Error al actualizar:', error);
        setIsUpdating(false);
      }
    }
  };

  if (!updateAvailable) return null;

  return (
    <Box
      position="fixed"
      bottom="4"
      right="4"
      bg="blue.500"
      color="white"
      p="4"
      borderRadius="md"
      boxShadow="lg"
      zIndex="9999"
      maxW="300px"
    >
      <Text mb="2" fontWeight="bold">
        Nueva versión disponible
      </Text>
      <Text mb="3" fontSize="sm">
        Hay una nueva versión de la aplicación. ¿Deseas actualizar?
      </Text>
      <Button
        size="sm"
        colorScheme="whiteAlpha"
        onClick={handleUpdate}
        mr="2"
        isLoading={isUpdating}
        loadingText="Actualizando..."
        disabled={isUpdating}
      >
        Actualizar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setUpdateAvailable(false)}
        disabled={isUpdating}
      >
        Más tarde
      </Button>
    </Box>
  );
};

export default PWAUpdatePrompt;