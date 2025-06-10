import { useState, useRef, useEffect } from 'react'

interface Option {
  id: number | string
  label: string
  value: any
}

interface SelectProps {
  options: Option[]
  value?: Option | null
  onChange: (value: Option | null) => void
  label?: string
  placeholder?: string
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  disabled?: boolean
  allowCustomValue?: boolean
  onCreateOption?: (input: string) => Promise<Option>
  containerRef?: React.RefObject<HTMLElement>
}

export const Autocomplete = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Seleccionar...',
  isLoading,
  isError,
  errorMessage,
  disabled,
  allowCustomValue = false,
  onCreateOption,
  containerRef
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options)


  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)

  // Debounced search term filter
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilteredOptions(
        options.filter(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }, 250)

    return () => clearTimeout(timeout)
  }, [searchTerm, options])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchTerm, filteredOptions])

  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement
      highlightedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [highlightedIndex])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault()
            if (!isOpen) {
                setIsOpen(true)
                setHighlightedIndex(0)
            } else {
                setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
            }
            break
        case 'ArrowUp':
            e.preventDefault()
            if (!isOpen) {
                setIsOpen(true)
                setHighlightedIndex(filteredOptions.length - 1)
            } else {
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
            }
            break
        case 'Enter':
            e.preventDefault()
            if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                selectOption(filteredOptions[highlightedIndex])
                setTimeout(() => {
                    const container = containerRef?.current || document;
                    const focusableElements = container.querySelectorAll(
                        'input:not([disabled]):not([type="hidden"]), ' +
                        'select:not([disabled]), ' +
                        'textarea:not([disabled]), ' +
                        '[data-autocomplete] input:not([disabled])'
                    );
                    
                    const focusableArray = Array.from(focusableElements);
                    const currentIndex = focusableArray.indexOf(e.target as HTMLElement);
                    
                    if (currentIndex < focusableArray.length - 1) {
                        const nextElement = focusableArray[currentIndex + 1] as HTMLElement;
                        nextElement.focus();
                        if (nextElement instanceof HTMLSelectElement) {
                            nextElement.click();
                        }
                    }
                }, 0);
            } else if (isOpen && allowCustomValue && searchTerm.trim() && onCreateOption) {
                createOption(searchTerm.trim())
            } else if (!isOpen) {
                setIsOpen(true)
                inputRef.current?.focus()
            }
            break
        case 'Escape':
            e.preventDefault()
            setIsOpen(false)
            setSearchTerm('')
            setHighlightedIndex(-1)
            inputRef.current?.blur()
            break
        case 'Tab':
            setIsOpen(false)
            setSearchTerm('')
            setHighlightedIndex(-1)
            break
    }
  }

  const selectOption = (option: Option) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const createOption = async (label: string) => {
    if (!onCreateOption) return

    try {
      const newOption = await onCreateOption(label)
      onChange(newOption)
      setIsOpen(false)
      setSearchTerm('')
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    } catch (err) {
      console.error('Error creating option:', err)
    }
  }

  const handleContainerClick = () => {
    if (disabled) return
    if (!isOpen) {
      setIsOpen(true)
      inputRef.current?.focus()
    }
  }

  const handleInputFocus = () => {
    if (!disabled && !isOpen) {
      setIsOpen(true)
    }
  }



  return (
    <div className="w-full" ref={selectRef} data-autocomplete>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={`
            relative w-full cursor-pointer border rounded-md
            transition-all duration-200
            ${isError
              ? 'border-red-300 focus-within:border-red-500'
              : 'border-gray-300 focus-within:border-blue-500'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
          onClick={handleContainerClick}
        >
          <input
            ref={inputRef}
            type="text"
            className="w-full py-2 pl-3 pr-10 text-sm border-none focus:ring-0 bg-transparent focus:outline-none"
            placeholder={placeholder}
            value={isOpen ? searchTerm : value?.label || ''}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete="off"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900" />
            ) : (
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        </div>

        {isOpen && (
          <div
            ref={optionsRef}
            className="absolute z-10 w-full mt-1 bg-white shadow-md max-h-60 rounded-md py-1 text-base overflow-auto border border-gray-200 transform transition-all duration-200 scale-95 opacity-0 animate-[fadeIn_0.15s_forwards]"
            style={{ animationFillMode: 'forwards' }}
          >
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Cargando...</div>
            ) : filteredOptions.length === 0 ? (
              allowCustomValue && onCreateOption ? (
                <div
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer"
                  onClick={() => createOption(searchTerm)}
                >
                  Crear "{searchTerm}"
                </div>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No hay resultados
                </div>
              )
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.id}
                  className={`px-4 py-2 cursor-pointer text-sm rounded-sm
                    ${value?.id === option.id
                      ? 'bg-blue-200 text-blue-900'
                      : index === highlightedIndex
                        ? 'bg-gray-200'
                        : 'hover:bg-blue-200'
                    }
                  `}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isError && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}
