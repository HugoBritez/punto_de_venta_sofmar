import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import {
  useCategoriasStore,
  CategoriaAdaptada,
} from "@/stores/categoriasStore";

interface CategoriasSelectProps {
  onChange: (categoriaId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const CategoriasSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar categoría",
  className = "",
}: CategoriasSelectProps) => {
  const { cargarCategorias, categorias, cargando, obtenerCategoriaPorId } =
    useCategoriasStore();

  // Cargar categorías al inicio
  useEffect(() => {
    cargarCategorias();
  }, []);

  // Obtener la categoría completa a partir del ID
  const categoriaSeleccionada =
    value !== null && value !== undefined
      ? obtenerCategoriaPorId(value) || null
      : null;

  // Función para cargar opciones basada en la búsqueda
  const loadOptions = async (inputValue: string) => {
    await cargarCategorias(inputValue);
  };

  // Manejador de cambio que devuelve solo el ID
  const handleChange = (categoria: CategoriaAdaptada | null) => {
    onChange(categoria ? categoria.id : null);
  };

  return (
    <SelectComponent<CategoriaAdaptada>
      options={categorias}
      value={categoriaSeleccionada}
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

export default CategoriasSelect;
