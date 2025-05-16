import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import { DvlAdapter, useDvlStore } from "@/stores/dvlStore";

interface DvlSelectProps {
  onChange: (dvlId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const DvlSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar dvl",
  className = "",
}: DvlSelectProps) => {
  const { cargarDvl, dvl, cargando, obtenerDvlPorId } =
    useDvlStore();

  // Cargar categorías al inicio
  useEffect(() => {
    cargarDvl();
  }, []);

  // Obtener la categoría completa a partir del ID
  const dvlSeleccionada =
    value !== null && value !== undefined
      ? obtenerDvlPorId(value) || null
      : null;

  // Función para cargar opciones basada en la búsqueda
  const loadOptions = async (inputValue: string) => {
    await cargarDvl(inputValue);
  };

  // Manejador de cambio que devuelve solo el ID
  const handleChange = (dvl: DvlAdapter | null) => {
    onChange(dvl ? dvl.id : null);
  };

  return (
    <SelectComponent<DvlAdapter>
      options={dvl}
      value={dvlSeleccionada}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron categorías"
      labelField="descripcion"
      className={className}
    />
  );
};

export default DvlSelect;
