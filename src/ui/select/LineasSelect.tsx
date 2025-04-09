import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import { LineasAdapter, useLineasStore } from "@/stores/lineasStore";

interface LineasSelectProps {
  onChange: (lineaId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const LineasSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar linea",
  className = "",
}: LineasSelectProps) => {
  const { cargarLineas, lineas, cargando, obtenerLineaPorId } =
    useLineasStore();

  // Cargar categorías al inicio
  useEffect(() => {
    cargarLineas();
  }, []);

  // Obtener la categoría completa a partir del ID
  const lineaSeleccionada =
    value !== null && value !== undefined
      ? obtenerLineaPorId(value) || null
      : null;

  // Función para cargar opciones basada en la búsqueda
  const loadOptions = async (inputValue: string) => {
    await cargarLineas(inputValue);
  };

  // Manejador de cambio que devuelve solo el ID
  const handleChange = (linea: LineasAdapter | null) => {
    onChange(linea ? linea.id : null);
  };

  return (
    <SelectComponent<LineasAdapter>
      options={lineas}
      value={lineaSeleccionada}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron lineas"
      labelField="descripcion"
      className={className}
    />
  );
};

export default LineasSelect;
