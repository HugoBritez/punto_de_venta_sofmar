import React, { useEffect, useState } from 'react';
import { useFacturacion } from '../../hooks/querys/useFacturacion';
import { DatosFacturacion } from '../../api/facturasApi';

interface SelectorTimbradoProps {
  className?: string;
  userId: number;
  sucursalId: number;
  onDatosCargados?: (datos: DatosFacturacion) => void;
  onDatosChange?: (datos: DatosFacturacion) => void;
}

export const SelectorTimbrado: React.FC<SelectorTimbradoProps> = ({
  className = "",
  userId,
  sucursalId,
  onDatosCargados,
  onDatosChange
}) => {
  // Estado local para los datos de factura
  const [datosFactura, setDatosFactura] = useState<DatosFacturacion | null>(null);
  const [timbradoSeleccionado, setTimbradoSeleccionado] = useState<string>("");

  // Usar el hook para obtener los datos de facturación
  const { data: datosFacturacion, isLoading, error } = useFacturacion(userId, sucursalId);

  // Obtener timbrados únicos (solo el primer registro de cada timbrado)
  const timbradosUnicos = React.useMemo(() => {
    if (!datosFacturacion) return [];
    const timbrados = new Map<string, DatosFacturacion>();
    datosFacturacion.forEach(dato => {
      if (!timbrados.has(dato.d_Nrotimbrado)) {
        timbrados.set(dato.d_Nrotimbrado, dato);
      }
    });
    return Array.from(timbrados.values());
  }, [datosFacturacion]);

  // Efecto para procesar los datos cuando se cargan
  useEffect(() => {
    if (datosFacturacion && datosFacturacion.length > 0) {
      const primerDato: DatosFacturacion = datosFacturacion[0];
      
      // Actualizar el estado local
      setDatosFactura(primerDato);
      setTimbradoSeleccionado(primerDato.d_Nrotimbrado);
      
      // Notificar al componente padre que los datos están cargados
      if (onDatosCargados) {
        onDatosCargados(primerDato);
      }
    }
  }, [datosFacturacion, onDatosCargados]);

  // Función para actualizar datos y notificar al padre
  const actualizarDatos = (nuevosDatos: DatosFacturacion) => {
    setDatosFactura(nuevosDatos);
    if (onDatosChange) {
      onDatosChange(nuevosDatos);
    }
  };

  // Función para manejar el cambio de timbrado seleccionado
  const handleTimbradoSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timbradoElegido = e.target.value;
    setTimbradoSeleccionado(timbradoElegido);
    
    // Buscar el primer registro para este timbrado
    const datosSeleccionados = datosFacturacion?.find(
      dato => dato.d_Nrotimbrado === timbradoElegido
    );
    
    if (datosSeleccionados) {
      actualizarDatos(datosSeleccionados);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className={`flex flex-row gap-4 p-4 bg-blue-100 rounded-md ${className}`}>
        <div className="flex items-center justify-center w-full">
          <p>Cargando datos de facturación...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className={`flex flex-row gap-4 p-4 bg-red-100 rounded-md ${className}`}>
        <div className="flex items-center justify-center w-full">
          <p className="text-red-600">Error al cargar datos de facturación</p>
        </div>
      </div>
    );
  }

  // Si no hay datos, no mostrar nada
  if (!datosFactura || !datosFacturacion) {
    return null;
  }

  const handleNumeroFacturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    actualizarDatos({
      ...datosFactura,
      d_Nro_Secuencia: value ? parseInt(value) - 1 : 0, // Restamos 1 porque mostramos el siguiente número
    });
  };

  return (
    <div className={`flex flex-row gap-4 p-4 bg-blue-100 rounded-md ${className}`}>
      <div className="flex flex-col gap-2 w-1/2">
        <p className="font-bold">Timbrado</p>
        <select
          className="border rounded-md p-2"
          value={timbradoSeleccionado}
          onChange={handleTimbradoSelectChange}
        >
          {timbradosUnicos.map((dato, index) => (
            <option key={index} value={dato.d_Nrotimbrado}>
              {dato.d_Nrotimbrado} - {dato.d_Descripcion}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 w-1/2">
        <p className="font-bold">Número de Factura</p>
        <div className="flex gap-2">
          <input
            type="text"
            className="border rounded-md p-2 w-16 text-center"
            maxLength={3}
            value={
              datosFactura.d_Establecimiento
                ?.toString()
                .padStart(3, "0") || ""
            }
            readOnly
            placeholder="000"
          />
          <span className="flex items-center">-</span>
          <input
            type="text"
            className="border rounded-md p-2 w-16 text-center"
            maxLength={3}
            value={
              datosFactura.d_P_Emision
                ?.toString()
                .padStart(3, "0") || ""
            }
            readOnly
            placeholder="000"
          />
          <span className="flex items-center">-</span>
          <input
            type="text"
            className="border rounded-md p-2 w-28 text-center"
            maxLength={7}
            value={
              (datosFactura.d_Nro_Secuencia + 1)
                ?.toString()
                .padStart(7, "0") || ""
            }
            onChange={handleNumeroFacturaChange}
            placeholder="0000000"
          />
        </div>
        <div className="text-sm text-gray-600">
          <p>Rango: {datosFactura.d_NroDesde} - {datosFactura.d_NroHasta}</p>
          <p>Vencimiento: {datosFactura.d_Fecha_Vence}</p>
        </div>
      </div>
    </div>
  );
};