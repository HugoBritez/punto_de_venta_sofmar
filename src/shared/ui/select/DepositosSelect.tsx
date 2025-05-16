import { useEffect } from "react";
import SelectComponent from "./SelectComponent";
import {
  useDepositosStore,
  DepositoAdaptado,
} from "../../../stores/depositoStore";

interface CategoriasSelectProps {
  onChange: (categoriaId: number | null) => void;
  value?: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const DepositosSelect = ({
  onChange,
  value,
  required = false,
  placeholder = "Seleccionar deposito",
  className = "",
}: CategoriasSelectProps) => {
  const { cargarDepositos, depositos, cargando, obtenerDepositoPorId } =
    useDepositosStore();

  // Cargar categorías al inicio
  useEffect(() => {
    cargarDepositos();
  }, []);

  // Obtener la categoría completa a partir del ID
  const depositoSeleccionado =
    value !== null && value !== undefined
      ? obtenerDepositoPorId(value) || null
      : null;

  // Función para cargar opciones basada en la búsqueda
  const loadOptions = async (inputValue: string) => {
    await cargarDepositos(inputValue);
  };

  // Manejador de cambio que devuelve solo el ID
  const handleChange = (deposito: DepositoAdaptado | null) => {
    onChange(deposito ? deposito.id : null);
  };

  return (
    <SelectComponent<DepositoAdaptado>
      options={depositos}
      value={depositoSeleccionado}
      onChange={handleChange}
      loadOptions={loadOptions}
      isLoading={cargando}
      required={required}
      placeholder={placeholder}
      noOptionsMessage="No se encontraron depositos"
      labelField="descripcion"
      className={className}
    />
  );
};

export default DepositosSelect;
