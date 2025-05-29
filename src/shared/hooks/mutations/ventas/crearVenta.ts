import { DetalleVenta } from "@/models/dtos/Ventas/DetalleVenta";
import { Venta } from "@/models/dtos/Ventas/Venta";
import { VentasRepository } from "@/repos/ventasRepository";
import { useMutation } from "@tanstack/react-query";

export const useCrearVenta = () => {
    return useMutation({
        mutationFn: async (params: { venta: Venta, detalle: DetalleVenta[] }) => {
            return await VentasRepository.CrearVenta(params.venta, params.detalle);
        },
        onSuccess: (data) => {
            return data;
        }
    });
}