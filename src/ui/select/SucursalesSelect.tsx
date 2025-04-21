import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import {
  useSucursalDataStore,
  SucursalAdaptado,
} from "../../stores/sucursalDataStore";

interface CategoriasSelectProps {
  onChange: (categoriaId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const SucursalesSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar sucursal",
  className = "",
}: CategoriasSelectProps) => {
  const { cargarSucursales, sucursales, cargando, obtenerSucursalPorId } =
    useSucursalDataStore();

  // Cargar categorías al inicio
  useEffect(() => {
    cargarSucursales();
  }, []);

  // Obtener la categoría completa a partir del ID
  const sucursalSeleccionada =
    value !== null && value !== undefined
      ? obtenerSucursalPorId(value) || null
      : null;

  // Función para cargar opciones basada en la búsqueda
  const loadOptions = async (inputValue: string) => {
    await cargarSucursales(inputValue);
  };

  // Manejador de cambio que devuelve solo el ID
  const handleChange = (sucursal: SucursalAdaptado | null) => {
    onChange(sucursal ? sucursal.id : null);
  };

  return (
    <SelectComponent<SucursalAdaptado>
      options={sucursales}
      value={sucursalSeleccionada}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron sucursales"
      labelField="descripcion"
      className={className}
    />
  );
};

export default SucursalesSelect;
