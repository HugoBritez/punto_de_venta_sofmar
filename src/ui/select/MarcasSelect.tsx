import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import {
  useMarcasStore,
  MarcaAdaptada,
} from "@/stores/marcasStore";

interface MarcasSelectProps {
  onChange: (marcaId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const MarcasSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar marca",
  className = "",
}: MarcasSelectProps) => {
  const { cargarMarcas, marcas, cargando, obtenerMarcaPorId } =
    useMarcasStore();

  // Cargar categorías al inicio
  useEffect(() => {
    cargarMarcas();
  }, []);

  // Obtener la categoría completa a partir del ID
  const marcaSeleccionada =
    value !== null && value !== undefined
      ? obtenerMarcaPorId(value) || null
      : null;

  // Función para cargar opciones basada en la búsqueda
  const loadOptions = async (inputValue: string) => {
    await cargarMarcas(inputValue);
  };

  // Manejador de cambio que devuelve solo el ID
  const handleChange = (marca: MarcaAdaptada | null) => {
    onChange(marca ? marca.id : null);
  };

  return (
    <SelectComponent<MarcaAdaptada>
      options={marcas}
      value={marcaSeleccionada}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron marcas"
      labelField="descripcion"
      className={className}
    />
  );
};

export default MarcasSelect;
