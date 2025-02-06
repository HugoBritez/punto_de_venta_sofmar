import React from "react";

interface FloatingCardProps<T> {
  isVisible: boolean;
  items: T[];
  onClose: () => void;
  onSelect: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
}

const FloatingCard = <T extends object>({
  isVisible,
  items,
  onClose,
  onSelect,
  renderItem = (item: T) => {
    const displayText =
      "nombre" in item
        ? (item as any).nombre
        : "descripcion" in item
        ? (item as any).descripcion
        : "Sin texto";
    return <p>{displayText}</p>;
  },
}: FloatingCardProps<T>) => {
  return (
    <div
      className={`absolute z-[9999] bg-white shadow-lg rounded-md border border-gray-200 p-4 w-full min-h-[100px] max-h-[200px] overflow-y-auto mt-12
        transition-all duration-400 ease-out origin-top
        ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
    >
      <div className="flex justify-end items-center mb-2">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      <div className="divide-y">
        {items.length === 0 ? (
          <div className="py-2 px-1">
            <p className="text-center text-gray-500 font-semibold">
              No se encontraron resultados.
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="py-2 px-1 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
              onClick={() => onSelect(item)}
            >
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FloatingCard;
