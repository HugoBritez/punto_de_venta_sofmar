import React from "react";

interface ConfiguracionCardProps {
    nombre: string;
    descripcion: string;
    icono: React.ReactNode;
    onClick: () => void;
    seleccionado: boolean
}

const ConfiguracionCard = ({
  nombre,
  descripcion,
  icono,
  onClick,
  seleccionado,
}: ConfiguracionCardProps) => {
  return (
    <div
      className={`flex flex-row gap-4 p-2 items-center rounded-md cursor-pointer shadow-sm h-20 transition-colors duration-200 ${
        seleccionado
            ? "bg-blue-50 border-l-4 border-sky-600"
            : "hover:bg-gray-100"
        }`}
        onClick={onClick}
      >
        {icono}
        <div className="flex flex-col ">
          <p className="text-md font-bold">{nombre}</p>
          <p className="text-sm text-gray-500">{descripcion}</p>
        </div>
      </div>
    );
};

export default ConfiguracionCard;