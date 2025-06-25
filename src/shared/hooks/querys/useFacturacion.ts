import { useQuery } from "@tanstack/react-query";
import { getDatosFacturacion } from "../../api/facturasApi";

export const useFacturacion = (userId: number, sucursalId: number) => {
    return useQuery({
        queryKey: ["facturacionData", userId, sucursalId],
        queryFn: () => getDatosFacturacion(userId, sucursalId),
        enabled: Boolean(userId && sucursalId),
    });
}