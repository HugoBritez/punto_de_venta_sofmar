import { useAuthStore } from '@/shared/stores/AuthStore';
import { useEffect } from 'react';

const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutos

export const useAuthActivity = () => {
  const { tokenExpiration, lastActivity, logout, updateActivity } = useAuthStore();

  useEffect(() => {
    const updateActivityHandler = () => {
      updateActivity();
    };

    const events = [
      "mousedown",
      "mousemove", 
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, updateActivityHandler));

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivityHandler));
    };
  }, [updateActivity]);

  useEffect(() => {
    if (tokenExpiration) {
      const checkSession = setInterval(() => {
        const now = new Date().getTime();
        const inactiveTime = now - lastActivity;

        if (now > tokenExpiration && inactiveTime >= INACTIVITY_THRESHOLD) {
          logout();
        }
      }, 1000);

      return () => clearInterval(checkSession);
    }
  }, [tokenExpiration, lastActivity, logout]);
};