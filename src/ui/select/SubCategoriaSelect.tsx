import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import {
  useSubCategoriasStore,
  SubCategoriasAdapter,
} from "@/stores/subCategoriasStore";

interface SubCategoriaSelectProps {
  onChange: (subCategoriaId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const SubCategoriaSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar subcategoría",
  className = "",
}: SubCategoriaSelectProps) => {
  const { cargarSubCategorias, subCategorias, cargando, obtenerSubCategoriaPorId } =
    useSubCategoriasStore();

  // Cargar categorías al inicio
  useEffect(() => {
    cargarSubCategorias();
  }, []);

  // Obtener la categoría completa a partir del ID
  const subCategoriaSeleccionada =
    value !== null && value !== undefined
      ? obtenerSubCategoriaPorId(value) || null
      : null;

  // Función para cargar opciones basada en la búsqueda
  const loadOptions = async (inputValue: string) => {
    await cargarSubCategorias(inputValue);
  };

  // Manejador de cambio que devuelve solo el ID
  const handleChange = (subCategoria: SubCategoriasAdapter | null) => {
    onChange(subCategoria ? subCategoria.id : null);
  };

  return (
    <SelectComponent<SubCategoriasAdapter>
      options={subCategorias}
      value={subCategoriaSeleccionada}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron subcategorías"
      labelField="descripcion"
      className={className}
    />
  );
};

export default SubCategoriaSelect;
