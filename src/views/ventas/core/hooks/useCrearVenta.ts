import { useState } from "react";
import { VentaDTO, DetalleVentaTabla } from "../../types/sharedDTO.type";
import { ventasApi } from "../services/ventasApi";

export const useCrearVenta = () => {
    const [errorDTO, setErrorDTO] = useState<string | null>(null);
    const [loadingDTO, setLoadingDTO] = useState<boolean>(false);

    const insertarVenta = async (
        venta: VentaDTO,
        detalles: DetalleVentaTabla[],
    ) => {
        try {
            setLoadingDTO(true);
            const response = await ventasApi.insertarVenta(venta, detalles);
            setLoadingDTO(false);
            return response;
        } catch (error) {
            setErrorDTO("Error al insertar la venta");
            throw error;
        } finally {
            setLoadingDTO(false);
        }
    }
    return {
        insertarVenta,
        errorDTO,
        loadingDTO,
    }
}