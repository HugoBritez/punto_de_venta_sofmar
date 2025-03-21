import { useEffect } from "react";
import SelectComponent from "../../../../ui/SelectComponent";
import {
  useMarcasStore,
  MarcaAdaptada,
} from "../../../../stores/marcasStore";

interface MarcasSelectProps {
  onChange: (marcaId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

const MarcasSelect = ({
  onChange,
  value,
  label = "Marca",
  required = false,
  placeholder = "Seleccionar marca",
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
      label={label}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron marcas"
      labelField="descripcion"
    />
  );
};

export default MarcasSelect;
