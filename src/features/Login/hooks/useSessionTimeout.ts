import { useEffect } from 'react';
import { useProveedorAuthStore } from '../store/ProveedorAuthStore';
import { useNavigate } from 'react-router-dom';

export const useSessionTimeout = () => {
    const { logout } = useProveedorAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener la expiración del sessionStorage directamente
        const sessionExpiration = sessionStorage.getItem('proveedor-session-expiration');
        console.log('useSessionTimeout - sessionExpiration from sessionStorage:', sessionExpiration);
        
        if (!sessionExpiration) {
            console.log('No hay expiración configurada en sessionStorage');
            return;
        }

        const expirationTime = parseInt(sessionExpiration);
        const checkExpiration = setInterval(() => {
            const now = new Date().getTime();
            const timeLeft = expirationTime - now;
            
            console.log('Verificando sesión - Tiempo restante:', Math.floor(timeLeft / 1000), 'segundos');
            
            if (now > expirationTime) {
                console.log('Sesión expirada, cerrando...');
                logout();
                sessionStorage.removeItem('proveedor-session-expiration');
                navigate('/proveedor-login');
            }
        }, 1000); // Verificar cada segundo

        return () => clearInterval(checkExpiration);
    }, [logout, navigate]);
};