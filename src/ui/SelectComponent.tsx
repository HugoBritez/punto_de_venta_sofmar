import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Tipo genérico con id y una propiedad que actúa como etiqueta
interface SelectOption {
  id: string | number;
  [key: string]: any;
}

interface SelectProps<T extends SelectOption> {
  options: T[];
  value?: T | null;
  onChange: (option: T | null) => void;
  placeholder?: string;
  isLoading?: boolean;
  loadOptions: (inputValue: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
  noOptionsMessage?: string;
  required?: boolean;
  label?: string;
  debounceMs?: number;
  // Nueva propiedad para indicar qué campo usar como etiqueta
  labelField?: keyof T;
}

const SelectComponent = <T extends SelectOption>({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  isLoading = false,
  loadOptions,
  disabled = false,
  className = "",
  noOptionsMessage = "No hay opciones",
  required = false,
  label,
  debounceMs = 300,
  // Por defecto usa 'label' si existe, sino el desarrollador debe especificarlo
  labelField = 'label' as keyof T,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar opciones iniciales
  useEffect(() => {
    loadOptions("");
  }, []);

  // Manejar clic fuera para cerrar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Manejar apertura del selector
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 10);
      }
    }
  };

  // Manejar selección de opción
  const handleSelect = (option: T) => {
    onChange(option);
    setIsOpen(false);
    setSearchValue("");
  };

  // Manejar búsqueda con debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Cancelar timer anterior si existe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce para no hacer muchas llamadas mientras el usuario escribe
    debounceTimerRef.current = setTimeout(() => {
      loadOptions(value);
    }, debounceMs);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Manejar tecla Escape para cerrar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <div className="flex mb-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}

      <div
        className={`flex items-center justify-between p-2 border rounded-md bg-white cursor-pointer ${
          isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        role="combobox"
      >
        <div className="flex-grow truncate">
          {value ? (
            <span>{value[labelField]}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center">
          {isLoading && (
            <div className="mr-2">
              <svg
                className="animate-spin h-4 w-4 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden"
            role="listbox"
            onKeyDown={handleKeyDown}
          >
            <div className="p-2 border-b">
              <input
                ref={inputRef}
                type="text"
                className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchValue}
                onChange={handleSearch}
                placeholder="Buscar..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="overflow-y-auto max-h-48">
              {options.length > 0 ? (
                options.map((option) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1 }}
                    className={`p-2 hover:bg-blue-50 cursor-pointer ${
                      value && value.id === option.id
                        ? "bg-blue-100 font-medium"
                        : ""
                    }`}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={!!(value && value.id === option.id)}
                  >
                    {option[labelField]}
                  </motion.div>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-center">
                  {isLoading ? "Cargando..." : noOptionsMessage}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectComponent;
