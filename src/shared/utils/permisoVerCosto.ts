import { useAuth } from "../../services/AuthContext";

export const permisoVerCosto = () => {
    const { auth } = useAuth();

    if(auth?.permisoVerUtilidad === 1) {
        return true;
    } else {
        return false;
    }
}