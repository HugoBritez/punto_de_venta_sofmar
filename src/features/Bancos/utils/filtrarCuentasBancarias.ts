import { CuentasBancariasViewModel } from "../types/cuentasbancarias.type";

export const filtrarCuentasBancarias = (cuentasBancarias: CuentasBancariasViewModel[], busqueda: string | undefined) : CuentasBancariasViewModel[] => {
    if (!busqueda) return cuentasBancarias;
    return cuentasBancarias.filter(cuenta => cuenta.bancoDescripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuenta.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuenta.titularDescripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuenta.monedaDescripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuenta.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuenta.mail.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuenta.telefono.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuenta.observacion.toLowerCase().includes(busqueda.toLowerCase())
    )
}
