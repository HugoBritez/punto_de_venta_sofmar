export interface InventarioViewModel {
    id: number;
    fecha_inicio: string;
    hora_inicio: string;
    fecha_cierre: string;
    hora_cierre: string;
    operador_id: number;
    operador_nombre: string;
    sucursal_id: number;
    sucursal_nombre: string;
    deposito_id: number;
    deposito_nombre: string;
    nro_inventario: string;
    estado: number;
    autorizado: number;
}