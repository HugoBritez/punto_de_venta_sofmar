import { useState } from 'react'
import FormularioFiltros from './ui/FormularioFiltros'
import { FiltrosDTO, Ingreso } from '../types/shared.type'
import FormularioCabecera from './ui/FormularioCabecera'
import { useGetDetalleIngreso, useGetIngresos } from '../hooks/useQueryIngresos'
import FormularioDetalle from './ui/FormularioDetalle'
import { Deposito } from '@/types/shared_interfaces';
const FormularioControl = () => {
    const [filtros, setFiltros] = useState<FiltrosDTO>({
        tipo_ingreso: 1,
        deposito: 0,
        sucursal: 0,
        nro_proveedor: 0,
        fecha_desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fecha_hasta: new Date().toISOString().split('T')[0],
        nro_factura: "",
        verificado: 0
    })

    const { data: ingresos, isLoading: loading, error } = useGetIngresos(filtros);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState<Ingreso | null>(null);
    const [depositos, setDepositos] = useState<Deposito[]>([]);
    const { data: detalleIngreso } = useGetDetalleIngreso(ingresoSeleccionado?.id_compra || 0);


    return (
        <div className="flex flex-col gap-2 w-full h-screen">
            <FormularioFiltros filtros={filtros} setFiltros={setFiltros} setDepositos={setDepositos} />
            <FormularioCabecera
                filtros={filtros}
                loading={loading}
                error={error ? error.message : null}
                ingresos={ingresos?.body || []}
                ingresoSeleccionado={ingresoSeleccionado}
                setIngresoSeleccionado={setIngresoSeleccionado}
                depositos={depositos}
                onRefresh={() => {
                    setIngresoSeleccionado(null);
                }}
            />
            {ingresoSeleccionado && (
                <FormularioDetalle
                    detalleIngreso={detalleIngreso?.body || []}
                />
            )}
        </div>
    );
}

export default FormularioControl
