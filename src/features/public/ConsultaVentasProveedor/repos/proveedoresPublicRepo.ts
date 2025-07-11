import api from "@/config/axios"

export const getConsultaVentas = async (fechaDesde: string, fechaHasta: string, proveedor: number, cliente?: number | null) => {
    const response = await api.get(`/proveedores/reporte`, {
        params: {
            fechaDesde,
            fechaHasta,
            proveedor,
            cliente
        }
    })
    return response.data.body
}