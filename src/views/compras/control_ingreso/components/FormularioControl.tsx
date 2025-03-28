import { useEffect, useState } from 'react'
import FormularioFiltros from './ui/FormularioFiltros'
import { FiltrosDTO, Ingreso } from '../types/shared.type'
import FormularioCabecera from './ui/FormularioCabecera'
import { useIngresos } from '../hooks/useIngresos'
import FormularioDetalle from './ui/FormularioDetalle'
const FormularioControl = () => {
    const [filtros, setFiltros] = useState<FiltrosDTO>({
        tipo_ingreso: 1,
        deposito: 0,
        sucursal: 0,
        nro_proveedor: 0,
        fecha_desde: "",
        fecha_hasta: "",
        nro_factura: "",
    })
    const { obtenerIngresos, ingresos, loading, error, loadingDetalle, errorDetalle } = useIngresos();

    const [ingresoSeleccionado, setIngresoSeleccionado] = useState<Ingreso | null>(null);
    
    useEffect(() => {
        obtenerIngresos(filtros);
    }, [filtros]);


  return (
    <div className="flex flex-col gap-2 w-full h-screen">
      <FormularioFiltros filtros={filtros} setFiltros={setFiltros} />
      <FormularioCabecera
        filtros={filtros}
        loading={loading}
        error={error}
        ingresos={ingresos}
        setIngresoSeleccionado={setIngresoSeleccionado}
      />
      {ingresoSeleccionado && (
        <FormularioDetalle
          id_ingreso={ingresoSeleccionado?.id_orden ?? null}
          loading={loadingDetalle}
          error={errorDetalle}

        />
      )}
    </div>
  );
}

export default FormularioControl
