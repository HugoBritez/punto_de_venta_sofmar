import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PresupuestoRepository } from "../../api/presupuestosRepository";
import { DetallePresupuestoEntity, PresupuestoEntity, PresupuestoObservacion } from "@/shared/types/presupuesto";

export const useCrearPresupuesto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: {presupuesto: PresupuestoEntity, observacion: PresupuestoObservacion, detalles: DetallePresupuestoEntity[]}) => PresupuestoRepository.CrearPresupuesto(data.presupuesto, data.observacion, data.detalles),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["presupuestos"]});
            queryClient.invalidateQueries({queryKey: ["presupuestos-cliente"]});
        }
    });
}
