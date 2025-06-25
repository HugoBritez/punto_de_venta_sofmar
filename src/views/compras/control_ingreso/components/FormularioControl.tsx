import { useState, useEffect } from 'react'
import FormularioFiltros from './ui/FormularioFiltros'
import { FiltrosDTO, Ingreso } from '../types/shared.type'
import FormularioCabecera from './ui/FormularioCabecera'
import { useGetDetalleIngreso, useGetIngresos } from '../hooks/useQueryIngresos'
import FormularioDetalle from './ui/FormularioDetalle'
import { Deposito } from '@/types/shared_interfaces';
import { useVerificadorConfigStore } from '../store/verificadorConfigStore';

const FormularioControl = () => {
    const { depositoSeleccionado, setDepositoSeleccionado } = useVerificadorConfigStore();
    
    const [filtros, setFiltros] = useState<FiltrosDTO>({
        tipo_ingreso: 1,
        deposito: depositoSeleccionado || 0,
        sucursal: 0,
        nro_proveedor: 0,
        fecha_desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        fecha_hasta: new Date().toISOString().split('T')[0],
        nro_factura: "",
        verificado: 0
    })

    // Actualizar filtros cuando cambie el depósito seleccionado
    useEffect(() => {
        if (depositoSeleccionado) {
            setFiltros(prev => ({ ...prev, deposito: depositoSeleccionado }));
        }
    }, [depositoSeleccionado]);

    // Función para manejar cambios en los filtros
    const handleFiltrosChange = (nuevosFiltros: FiltrosDTO) => {
        setFiltros(nuevosFiltros);
        // Guardar el depósito seleccionado
        if (nuevosFiltros.deposito !== depositoSeleccionado) {
            setDepositoSeleccionado(nuevosFiltros.deposito);
        }
    };

    const { data: ingresos, isLoading: loading, error } = useGetIngresos(filtros);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState<Ingreso | null>(null);
    const [depositos, setDepositos] = useState<Deposito[]>([]);
    const { data: detalleIngreso, refetch: refetchDetalle } = useGetDetalleIngreso(ingresoSeleccionado?.id_compra || 0);

    // Función para manejar cuando se verifica un item
    const handleItemVerificado = () => {
        // Refetch del detalle para obtener datos actualizados
        refetchDetalle();
    };

    return (
        <div className="flex flex-col gap-2 w-full h-screen">
            <FormularioFiltros 
                filtros={filtros} 
                setFiltros={handleFiltrosChange} 
                setDepositos={setDepositos} 
            />
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
                    onItemVerificado={handleItemVerificado}
                />
            )}
        </div>
    );
}

export default FormularioControl
