import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import {
  useProveedoresStore,
  ProveedorAdapter
} from "@/stores/proveedoresStore";

interface ProveedoresSelectProps {
  onChange: (proveedorId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const ProveedoresSelect = ({
  onChange,
  value,
  label = "Proveedor",
  required = false,
  placeholder = "Seleccionar proveedor",
  className = "",
}: ProveedoresSelectProps) => {
  const { cargarProveedores, proveedores, cargando, obtenerProveedorPorId } =
    useProveedoresStore();
  useEffect(() => {
    cargarProveedores();
  }, []);
  const proveedorSeleccionado =
    value !== null && value !== undefined
      ? obtenerProveedorPorId(value) || null
      : null;
  const loadOptions = async (inputValue: string) => {
    await cargarProveedores(inputValue);
  };
  const handleChange = (proveedor: ProveedorAdapter | null) => {
    onChange(proveedor ? proveedor.id : null);
  };

  return (
    <SelectComponent<ProveedorAdapter>
      options={proveedores}
      value={proveedorSeleccionado}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      label={label}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron proveedores"
      labelField="descripcion"
      className={className}
    />
  );
};

export default ProveedoresSelect;
