import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import { OperadorAdapter, useOperadoresStore } from "@/stores/operadoresStore";

interface OperadoresSelectProps {
  onChange: (operadorId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const OperadoresSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar operador",
  className = "",
}: OperadoresSelectProps) => {
  const { cargarOperadores, operadores, cargando, obtenerOperadorPorId } =
    useOperadoresStore();

  // Cargar categorías al inicio
  useEffect(() => {
    cargarOperadores();
  }, []);

  // Obtener la categoría completa a partir del ID
  const operadorSeleccionado =
    value !== null && value !== undefined
      ? obtenerOperadorPorId(value) || null
      : null;

  // Función para cargar opciones basada en la búsqueda
  const loadOptions = async (inputValue: string) => {
    await cargarOperadores(inputValue);
  };

  // Manejador de cambio que devuelve solo el ID
  const handleChange = (operador: OperadorAdapter | null) => {
    onChange(operador ? operador.id : null);
  };

  return (
    <SelectComponent<OperadorAdapter>
      options={operadores}
      value={operadorSeleccionado}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron operadores"
      labelField="descripcion"
      className={className}
    />
  );
};

export default OperadoresSelect;
