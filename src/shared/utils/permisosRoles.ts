import { useAuthStore } from "../stores/authStore";

export const esAdmin = () => {
    const rol = useAuthStore.getState().usuario?.or_rol;

    if(rol === 7 ) {
        return true;
    } else {
        return false;
    }
}

export const esSupervisor = () => {
    const rol = useAuthStore.getState().usuario?.or_rol;
    if(rol === 11) {
        return true;
    } else {
        return false;
    }
}


export const esVendedor = () => {
    const rol = useAuthStore.getState().usuario?.or_rol;
    if(rol === 5) {
        return true;
    } else {
        return false;
    }
}

