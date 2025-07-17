import { useMutation } from "@tanstack/react-query";
import { proveedorLoginRepo } from "../repo/proveedorLoginRepo";
import { useProveedorAuthStore } from "../store/ProveedorAuthStore";

export const useLoginProveedores = () => {
    return useMutation({
        mutationFn: ({email, ruc}: {email: string, ruc: string}) => proveedorLoginRepo(email, ruc),
        onSuccess: (data) => {
            const expirationTime = new Date().getTime() + 30 * 60 * 1000; // 30 minutos
            console.log('Login exitoso - Configurando expiración:', new Date(expirationTime));
            
            // Guardar en sessionStorage para el timeout
            sessionStorage.setItem('proveedor-session-expiration', expirationTime.toString());
            
            useProveedorAuthStore.setState({ 
                proveedor: data.proveedor, 
                token: data.token, 
                proEsAdmin: data.proEsAdmin,
                sessionExpiration: expirationTime
            });
            
            // Verificar que se guardó correctamente
            setTimeout(() => {
                const store = useProveedorAuthStore.getState();
                console.log('Estado del store después del login:', store);
                console.log('SessionStorage expiración:', sessionStorage.getItem('proveedor-session-expiration'));
            }, 100);
        },
        onError: (error) => {
            console.error('Error en login de proveedor:', error);
        }
    })
}