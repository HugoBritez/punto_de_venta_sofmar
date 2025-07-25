import { ListaPrecio } from "@/shared/types/listaPrecio"
import { Moneda } from "@/shared/types/moneda"
import { DetallePresupuestoEntity } from "@/shared/types/presupuesto"
import { Articulo } from "@/ui/articulos/types/articulo.type"

export const adaptarArticuloPresupuesto = (
    articulo: Articulo,
    cantidad: number,
    precio?: number,
    descuento?: number,
    descripcionEditada?: string,
    listaPrecio: ListaPrecio,
    monedaSeleccionada: Moneda,

) : DetallePresupuestoEntity =>  {
    
}