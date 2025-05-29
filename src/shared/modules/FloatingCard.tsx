import React, { useState, useEffect, useCallback } from "react";

interface FloatingCardProps<T> {
  isVisible: boolean;
  items: T[] | undefined; // Ahora permite undefined explícitamente
  onClose: () => void;
  onSelect: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  renderGeneral?: (items: T[], selectedIndex: number) => React.ReactNode;
  className?: string;
}

const FloatingCard = <T extends object>({
  isVisible,
  items = [], // Valor por defecto para evitar undefined
  onClose,
  onSelect,
  renderGeneral,
  className = "",
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
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Asegurar que items sea siempre un array
  const safeItems = items ?? [];

  // Resetear el índice seleccionado cuando cambian los items o se oculta
  useEffect(() => {
    setSelectedIndex(-1);
  }, [safeItems, isVisible]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < safeItems.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < safeItems.length) {
            onSelect(safeItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isVisible, safeItems, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={`absolute z-[9999] bg-white shadow-xs rounded-md border border-gray-200 p-4 w-full min-h-[100px] max-h-[500px] overflow-y-auto mt-2
        transition-all duration-400 ease-out origin-top
        ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }
        ${className}`}
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
        {safeItems.length === 0 ? (
          <div className="py-2 px-1">
            <p className="text-center text-gray-500 font-semibold">
              {items === undefined 
                ? "Cargando..." 
                : "No se encontraron resultados."
              }
            </p>
          </div>
        ) : renderGeneral ? (
          renderGeneral(safeItems, selectedIndex)
        ) : (
          safeItems.map((item, index) => (
            <div
              key={index}
              className={`py-2 px-1 cursor-pointer transition-colors duration-150
                ${
                  index === selectedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              onClick={() => onSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
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