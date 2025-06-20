import { useState, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface AutocompleteProps<T> {
  data: T[]
  value: T | null
  onChange: (value: T | null) => void
  label?: string
  placeholder?: string
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  disabled?: boolean
  allowCustomValue?: boolean
  onCreateOption?: (input: string) => Promise<T>
  containerRef?: React.RefObject<HTMLElement>
  displayField: keyof T
  searchFields: (keyof T)[]
  defaultId?: number | string
  idField?: keyof T
  additionalFields?: {
    field: keyof T
    label: string
    formatter?: (value: any) => string
  }[]
  id?: string
  onSearch?: (input: string) => Promise<T[]>
}

export const Autocomplete = <T = unknown>({
  data,
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
  containerRef,
  displayField,
  searchFields,
  defaultId,
  idField = 'id' as keyof T,
  additionalFields,
  id,
  onSearch
}: AutocompleteProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [filteredData, setFilteredData] = useState<T[]>(data)
  const [isLoadingInternal, setIsLoadingInternal] = useState(false)
  const [isErrorInternal, setIsErrorInternal] = useState(false)

  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const defaultAppliedRef = useRef(false)

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => additionalFields?.length ? 70 : 40,
    overscan: 5
  })

  useEffect(() => {
    if (onSearch) {
      setIsLoadingInternal(true)
      setIsErrorInternal(false)
      onSearch(searchTerm)
        .then(setFilteredData)
        .catch(() => setIsErrorInternal(true))
        .finally(() => setIsLoadingInternal(false))
    } else {
      const timeout = setTimeout(() => {
        const searchTermLower = searchTerm.toLowerCase().trim()
        setFilteredData(
          data.filter(item =>
            searchFields.some(field =>
              String(item[field]).toLowerCase().includes(searchTermLower)
            )
          )
        )
      }, 250)
      return () => clearTimeout(timeout)
    }
  }, [searchTerm, data, searchFields, onSearch])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchTerm, filteredData])

  useEffect(() => {
    if (highlightedIndex >= 0) {
      rowVirtualizer.scrollToIndex(highlightedIndex, {
        align: 'auto',
      })
    }
  }, [highlightedIndex, rowVirtualizer])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        if (value) {
          setSearchTerm(value[displayField]?.toString() || '')
        } else {
          setSearchTerm('')
        }
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value, displayField])

  useEffect(() => {
    if (
      defaultId &&
      !value &&
      data.length > 0 &&
      !defaultAppliedRef.current
    ) {
      const defaultOption = data.find(item => item[idField] === defaultId)
      if (defaultOption) {
        onChange(defaultOption)
        setSearchTerm(defaultOption[displayField]?.toString() || '')
        defaultAppliedRef.current = true
      }
    }
  }, [defaultId, data, idField, onChange, displayField])

  // Función para obtener el valor que debe mostrarse en el input
  const getInputDisplayValue = () => {
    if (value && !isOpen) {
      return value[displayField]?.toString() || ''
    }
    return searchTerm
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    if (!isOpen) {
      setIsOpen(true)
    }
    if (!newValue.trim()) {
      onChange(null)
    }
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
          setHighlightedIndex(prev => {
            const nextIndex = prev < filteredData.length - 1 ? prev + 1 : 0
            return nextIndex
          })
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setHighlightedIndex(filteredData.length - 1)
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : filteredData.length - 1
            return nextIndex
          })
        }
        break
      case 'Enter':
        e.preventDefault()
        if (isOpen && highlightedIndex >= 0 && filteredData[highlightedIndex]) {
          selectOption(filteredData[highlightedIndex])
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
        setSearchTerm(value?.[displayField]?.toString() || '')
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
      case 'Tab':
        setIsOpen(false)
        setSearchTerm(value?.[displayField]?.toString() || '')
        setHighlightedIndex(-1)
        break
    }
  }

  const selectOption = (option: T) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm(option[displayField]?.toString() || '')
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const createOption = async (label: string) => {
    if (!onCreateOption || !label.trim()) return

    try {
      const newOption = await onCreateOption(label.trim())
      onChange(newOption)
      setIsOpen(false)
      setSearchTerm(newOption[displayField]?.toString() || '')
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    } catch (err) {
      console.error('Error creating option:', err)
    }
  }

  const handleContainerClick = () => {
    console.log('Container clicked');
    if (disabled) return
    if (!isOpen) {
      setIsOpen(true)
      inputRef.current?.focus()
    }
  }

  const handleInputFocus = () => {
    if (!disabled && !isOpen) {
      setIsOpen(true)
      // Cuando se enfoca el input, mostrar el searchTerm actual
      if (value) {
        setSearchTerm(value[displayField]?.toString() || '')
      }
    }
  }

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Limpiar tanto el value como el searchTerm
    onChange(null)
    setSearchTerm('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    // Enfocar el input después de limpiar
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const loading = onSearch ? isLoadingInternal : isLoading
  const error = onSearch ? isErrorInternal : isError

  return (
    <div className="w-full" ref={selectRef} data-autocomplete id={id}>
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
            ${error
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
            className={`w-full py-2 pl-3 pr-10 text-sm border-none focus:ring-0 bg-transparent focus:outline-none ${disabled ? 'cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            value={getInputDisplayValue()}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete="off"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="autocomplete-options"
            role="combobox"
            aria-label={label || placeholder}
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900" />
            ) : value ? (
              <button
                type="button"
                className="text-gray-400 hover:text-red-500 focus:outline-none"
                onClick={handleClearSelection}
                tabIndex={-1}
                aria-label="Borrar selección"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
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
            ref={parentRef}
            id="autocomplete-options"
            className="absolute z-10 w-full mt-1 bg-white shadow-md rounded-md border border-gray-200 overflow-auto"
            style={{ 
              maxHeight: '240px'
            }}
            role="listbox"
          >
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Cargando...</div>
            ) : filteredData.length === 0 ? (
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
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative'
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const option = filteredData[virtualRow.index]
                  const isSelected = value?.[displayField] === option?.[displayField]
                  const isHighlighted = virtualRow.index === highlightedIndex
                  
                  return (
                    <div
                      key={`${option?.[displayField]?.toString()}-${virtualRow.index}`}
                      className={`
                        absolute top-0 left-0 w-full px-4 py-2 cursor-pointer text-sm
                        transition-colors duration-150
                        ${isSelected
                          ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-900'
                          : isHighlighted
                            ? 'bg-blue-50 border-l-4 border-blue-300'
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }
                      `}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`
                      }}
                      onClick={() => selectOption(option!)}
                      onMouseEnter={() => setHighlightedIndex(virtualRow.index)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {additionalFields && additionalFields.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900 truncate">
                            {option?.[displayField]?.toString()}
                          </span>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                            {additionalFields
                              .filter(field => field.field !== displayField)
                              .map((field, index) => (
                                <span key={index} className="flex items-center gap-1">
                                  <span className="font-medium text-gray-500">{field.label}:</span>
                                  <span className="truncate">
                                    {field.formatter 
                                      ? field.formatter(option?.[field.field])
                                      : option?.[field.field]?.toString()}
                                  </span>
                                </span>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900 truncate">
                          {option?.[displayField]?.toString()}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}