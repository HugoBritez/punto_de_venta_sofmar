import { useMutation } from "@tanstack/react-query";
import { proveedorLoginRepo } from "../repo/proveedorLoginRepo";
import { useProveedorAuthStore } from "../store/ProveedorAuthStore";

export const useLoginProveedores = () => {
    return useMutation({
        mutationFn: ({email, ruc}: {email: string, ruc: string}) => proveedorLoginRepo(email, ruc),
        onSuccess: (data) => {
            useProveedorAuthStore.setState({ proveedor: data.proveedor, token: data.token, proEsAdmin: data.proEsAdmin });
        },
        onError: (error) => {
            console.error('Error en login de proveedor:', error);
            // No necesitamos hacer nada más aquí, el componente manejará el error
        }
    })
}