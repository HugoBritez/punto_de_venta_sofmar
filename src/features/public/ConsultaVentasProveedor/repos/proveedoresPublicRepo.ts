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
    console.log('response.data.body en getConsultaVentas' ,response.data.body)
    return response.data.body
}