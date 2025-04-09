import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import {
  useClientesStore,
  ClienteAdapter
} from "@/stores/clientesStore";

interface ClientesSelectProps {
  onChange: (clienteId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const ClientesSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar cliente",
  className = "",
}: ClientesSelectProps) => {
  const { cargarClientes, clientes, cargando, obtenerClientePorId } =
    useClientesStore();
  useEffect(() => {
    cargarClientes();
  }, []);
  const clienteSeleccionado =
    value !== null && value !== undefined
      ? obtenerClientePorId(value) || null
      : null;
  const loadOptions = async (inputValue: string) => {
    await cargarClientes(inputValue);
  };
  const handleChange = (cliente: ClienteAdapter | null) => {
    onChange(cliente ? cliente.id : null);
  };

  return (
    <SelectComponent<ClienteAdapter>
      options={clientes}
      value={clienteSeleccionado}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron clientes"
      labelField="descripcion"
      className={className}
    />
  );
};

export default ClientesSelect;
