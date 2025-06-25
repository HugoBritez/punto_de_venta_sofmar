import React, { useEffect, useState } from 'react';
import { Box, Button, Text, useToast } from '@chakra-ui/react';

const PWAUpdatePrompt: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const toast = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
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
  }, [toast]);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
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
      >
        Actualizar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setUpdateAvailable(false)}
      >
        Más tarde
      </Button>
    </Box>
  );
};

export default PWAUpdatePrompt;