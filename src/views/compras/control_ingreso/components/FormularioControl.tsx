import { useEffect, useState } from 'react'
import FormularioFiltros from './ui/FormularioFiltros'
import { FiltrosDTO, Ingreso } from '../types/shared.type'
import FormularioCabecera from './ui/FormularioCabecera'
import { useIngresos } from '../hooks/useIngresos'
import FormularioDetalle from './ui/FormularioDetalle'
import { Deposito } from '@/shared/types/shared_interfaces';
const FormularioControl = () => {
    const [filtros, setFiltros] = useState<FiltrosDTO>({
        tipo_ingreso: 1,
        deposito: 0,
        sucursal: 0,
        nro_proveedor: 0,
        fecha_desde: "",
        fecha_hasta: "",
        nro_factura: "",
        verificado: 0
    })

    const { obtenerIngresos, ingresos, loading, error, detalleIngreso, obtenerDetalleIngreso } = useIngresos();
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState<Ingreso | null>(null);
    const [depositos, setDepositos] = useState<Deposito[]>([]);

    useEffect(() => {
        obtenerIngresos(filtros);
    }, [filtros]);

    useEffect(() => {
        if (ingresoSeleccionado) {
            obtenerDetalleIngreso(ingresoSeleccionado.id_compra);
            console.log('detalleIngreso en formulario control', detalleIngreso);
        }
    }, [ingresoSeleccionado]);

    return (
        <div className="flex flex-col gap-2 w-full h-screen">
            <FormularioFiltros filtros={filtros} setFiltros={setFiltros} setDepositos={setDepositos} />
            <FormularioCabecera
                filtros={filtros}
                loading={loading}
                error={error}
                ingresos={ingresos}
                ingresoSeleccionado={ingresoSeleccionado}
                setIngresoSeleccionado={setIngresoSeleccionado}
                depositos={depositos}
            />
            {ingresoSeleccionado && (
                <FormularioDetalle
                    detalleIngreso={detalleIngreso || []}
                />
            )}
        </div>
    );
}

export default FormularioControl
