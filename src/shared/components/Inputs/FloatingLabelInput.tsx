import { useState } from "react";

interface FloatingLabelInputProps  {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    className?: string;
    error?: boolean;
    disabled?: boolean;
}

// Componente FloatingLabelInput mejorado
export const FloatingLabelInput = ({ 
    label, 
    value, 
    onChange, 
    type = "text", 
    placeholder = "", 
    className = "",
    error = false,
    disabled = false,
    ...props 
}: FloatingLabelInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.toString().length > 0;
  
    return (
      <div className={`relative ${className}`}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md 
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            peer
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />
        <label
          className={`
            absolute left-3 transition-all duration-200 ease-in-out pointer-events-none
            ${isFocused || hasValue
              ? 'top-1 text-xs bg-white px-1 transform -translate-y-1'
              : 'top-3 text-sm'
            }
            ${isFocused 
              ? 'text-blue-600' 
              : error 
                ? 'text-red-500' 
                : 'text-gray-500'
            }
            ${disabled ? 'text-gray-400' : ''}
          `}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  };