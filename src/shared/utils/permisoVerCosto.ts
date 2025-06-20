import { useAuthStore } from "../stores/authStore";

export const permisoVerCosto = () => {
    const verCosto = useAuthStore.getState().usuario?.op_ver_utilidad

    if(verCosto === 1) {
        return true;
    } else {
        return false;
    }
}