import { PersonaViewModel } from "@/models/viewmodels/PersonaViewModel"
import { useGetPersonaByRuc, useGetPersonas } from "@/shared/hooks/queries/usePersonas"
import Modal from "@/shared/ui/modal/Modal"
import { ColumnDef, useReactTable, getSortedRowModel, getCoreRowModel, flexRender, Cell, Table } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import CrearPersonaForm from "./components/CrearPersonaForm"
import { puedeCrear, puedeEditar } from "@/shared/utils/verificarPermiso"
import { useMediaQuery, useToast } from "@chakra-ui/react"

// Componente de loading con animación - SOLO para la tabla
const TableLoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <span className="text-sm text-gray-600">Cargando...</span>
        </div>
    </div>
);

// Componente de loading inicial (primera carga)
const InitialLoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Cargando personas</p>
                <p className="text-sm text-gray-500">Por favor espere...</p>
            </div>
        </div>
    </div>
);

// Componente de error mejorado
const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
    <div className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
            <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar personas</h3>
            <p className="text-gray-600 mb-6">No pudimos obtener la información. Por favor, verifica tu conexión e intenta nuevamente.</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                </button>
            )}
        </div>
    </div>
);

// Componente para estado vacío
const EmptyState = () => (
    <div className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
            <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay personas disponibles</h3>
            <p className="text-gray-500">No se encontraron personas registradas en el sistema.</p>
        </div>
    </div>
);

const ActionMenu = ({ persona, onEdit, onDelete }: {
    persona: PersonaViewModel,
    onEdit: (persona: PersonaViewModel) => void,
    onDelete: (persona: PersonaViewModel) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef} style={{ zIndex: 1000 }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:bg-gray-100  rounded-md transition-colors duration-150 focus:outline-none"
                aria-label="Acciones"
            >
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="fixed bg-white rounded-md shadow-lg border border-gray-200"
                    style={{
                        zIndex: 1000,
                        width: '8rem',
                        right: 0,
                        marginTop: '0.25rem'
                    }}
                >
                    <div className="py-1 bg-white" >
                        <button
                            onClick={() => {
                                onEdit(persona);
                                setIsOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                        </button>
                        <button
                            onClick={() => {
                                onDelete(persona);
                                setIsOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const PersonasTable = ({
    personas,
    isLoading,
    onEdit,
    onDelete,
    focusedRowIndex,
    setFocusedRowIndex
}: {
    personas: PersonaViewModel[],
    isLoading: boolean,
    onEdit: (persona: PersonaViewModel) => void,
    onDelete: (persona: PersonaViewModel) => void,
    focusedRowIndex: number
    setFocusedRowIndex: (index: number) => void
}) => {
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const columns: ColumnDef<PersonaViewModel>[] = useMemo(() => [
        {
            accessorKey: 'id',
            header: "Código",
            enableSorting: true,
            size: 100,
        },
        {
            accessorKey: "razonSocial",
            header: "Razón Social",
            enableSorting: true,
            size: 370,
        },
        {
            accessorKey: "nombreFantasia",
            header: "Nombre de Fantasía",
            enableSorting: true,
            size: 370,
        },
        {
            accessorKey: "ruc",
            header: "RUC",
            enableSorting: true,
            size: 150,
        },
        {
            accessorKey: "direccion",
            header: "Dirección",
            size: 300,
        },
        {
            accessorKey: "telefono",
            header: "Teléfono",
            size: 220,
        },
        {
            accessorKey: "email",
            header: "Email",
            size: 300,
        },
        {
            accessorKey: "tipo",
            header: "Tipo",
            size: 150,
        },
        {
            id: "actions",
            header: "",
            size: 100,
            cell: ({ row }) => (
                <ActionMenu
                    persona={row.original}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ),
        }
    ], [onEdit, onDelete]);

    const table = useReactTable({
        data: personas,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // Scroll a la parte superior cuando cambien los datos
    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [personas]);

    if (isLoading) {
        return <TableLoadingSpinner />;
    }

    return (
        <div className="overflow-hidden">
            <div
                ref={tableContainerRef}
                className="overflow-auto h-[700px] bg-white"
                style={{
                    position: 'relative',
                    scrollbarWidth: 'thin'
                }}
            >
                <table style={{ display: 'grid' }}>
                    <thead
                        style={{
                            display: 'grid',
                            position: 'sticky',
                            top: 0,
                            zIndex: 20,
                        }}
                        className="bg-blue-500 border-b border-gray-200"
                    >
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr
                                key={headerGroup.id}
                                style={{ display: 'flex', width: '100%' }}
                            >
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        style={{
                                            display: 'flex',
                                            width: header.getSize(),
                                        }}
                                        className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 hover:text-black transition-colors duration-300 ease-in border-r border-blue-400 last:border-r-0"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                            {header.column.getCanSort() && (
                                                <span className="text-gray-400">
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                                        </svg>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <PersonasTableBody
                        table={table}
                        tableContainerRef={tableContainerRef}
                        focusedRowIndex={focusedRowIndex}
                        onRowClick={setFocusedRowIndex}
                    />
                </table>
            </div>
        </div>
    );
};

interface PersonasTableBodyProps {
    table: Table<PersonaViewModel>;
    tableContainerRef: React.RefObject<HTMLDivElement>;
    focusedRowIndex: number;
    onRowClick: (index: number) => void;
}

function PersonasTableBody({ table, tableContainerRef, focusedRowIndex, onRowClick }: PersonasTableBodyProps) {
    const { rows } = table.getRowModel();

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 48,
        getScrollElement: () => tableContainerRef.current,
        overscan: 8,
    });

    return (
        <tbody
            style={{
                display: 'grid',
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
            }}
        >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index];
                const isFocused = focusedRowIndex === virtualRow.index;

                return (
                    <tr
                        key={row.id}
                        onClick={() => onRowClick(virtualRow.index)}
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            transform: `translateY(${virtualRow.start}px)`,
                            width: '100%',
                            height: '48px'
                        }}
                        className={`transition-all duration-150 border-b border-gray-100 ${isFocused
                            ? 'bg-blue-50 shadow-inner border-blue-200 transform scale-[1.01] z-10'
                            : 'hover:bg-gray-50 hover:shadow-sm'
                            } group`}
                    >
                        {row.getVisibleCells().map((cell: Cell<PersonaViewModel, unknown>) => (
                            <td
                                key={cell.id}
                                style={{
                                    display: 'flex',
                                    width: cell.column.getSize(),
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'visible'
                                }}
                                className="border-r border-gray-100 last:border-r-0 px-6 py-3 text-sm text-gray-900 overflow-hidden"
                            >
                                <div className="truncate w-full" title={String(cell.getValue())}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            </td>
                        ))}
                    </tr>
                );
            })}
        </tbody>
    );
}
const PersonasList = () => {
    const [busquedaString, setBusquedaString] = useState<string>('')
    const [tipo, setTipo] = useState<number>(0)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [isOpenCrearNuevo, setIsOpenCrearNuevo] = useState<boolean>(false);
    const [isOpenEditar, setIsOpenEditar] = useState<boolean>(false);

    // Agregar debounce para la búsqueda y cambio de tipo
    const [debouncedBusqueda, setDebouncedBusqueda] = useState(busquedaString);
    const [debouncedTipo, setDebouncedTipo] = useState(tipo);
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
    const [selectedTipo, setSelectedTipo] = useState<number | undefined>(undefined);
    const toast = useToast()


    const permisoCrear = puedeCrear(2, 4)
    const permisoEditar = puedeEditar(2, 4);

    // Aseguramos que los parámetros sean del tipo correcto antes de llamar al hook
    const rucValido = typeof selectedId === 'number' ? selectedId : 0;
    const tipoValido = typeof selectedTipo === 'number' ? selectedTipo : 0;

    const { data: PersonaDetalle, isLoading: isLoadingPersonaDetalle } = useGetPersonaByRuc(rucValido, tipoValido);

    // Mantener el foco en el input durante los cambios
    useEffect(() => {
        if (searchInputRef.current && document.activeElement === searchInputRef.current) {
            // Si el input estaba enfocado, mantener el foco después del re-render
            const cursorPosition = searchInputRef.current.selectionStart;
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    if (cursorPosition !== null) {
                        searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
                    }
                }
            }, 0);
        }
    }, [debouncedBusqueda]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedBusqueda(busquedaString);
        }, 300);

        return () => clearTimeout(timer);
    }, [busquedaString]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTipo(tipo);
        }, 100);

        return () => clearTimeout(timer);
    }, [tipo]);

    const { data: Personas, isLoading: isPersonasLoading, isError: isPersonasError, refetch } = useGetPersonas(debouncedTipo, debouncedBusqueda)
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    // Marcar que ya no es la carga inicial después del primer resultado
    useEffect(() => {
        if (Personas && isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [Personas, isInitialLoad]);

    // Opciones de filtro de tipo - Memoizado
    const tipoOptions = useMemo(() => [
        { value: 0, label: 'Todos' },
        { value: 1, label: 'Proveedores' },
        { value: 2, label: 'Clientes' }
    ], []);

    // Handlers para las acciones - Memoizados
    const handleEdit = useCallback((persona: PersonaViewModel) => {
        if (!permisoEditar) {
            toast({
                title: "Permiso denegado",
                description: "No tienes permisos para editar un cliente/proveedor nuevo",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Determinar el tipo de persona
        const tipoPersona = determinarTipoPersona(persona);
        setSelectedId(persona.id);
        setSelectedTipo(tipoPersona);
        setIsOpenEditar(true);
    }, [permisoEditar, toast]);

    // Función auxiliar para determinar el tipo de persona
    const determinarTipoPersona = (persona: PersonaViewModel): number => {
        if (persona.tipo.toLocaleLowerCase() === "proveedor") return 1;
        if (persona.tipo.toLocaleLowerCase() === "cliente") return 0;
        return -1;
    };

    const handleCloseEditar = useCallback(() => {
        setIsOpenEditar(false);
        setSelectedId(undefined);
        setSelectedTipo(undefined);
    }, []);

    const handleDelete = useCallback((persona: PersonaViewModel) => {
        console.log('Eliminar persona:', persona);
        // Aquí iría la lógica para eliminar
    }, []);

    const handleCreate = useCallback(() => {
        if (permisoCrear) {
            setIsOpenCrearNuevo(true)
        }
        else {
            toast({
                title: "Permiso denegado",
                description: "No tienes permisos para crear un cliente/proveedor nuevo",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }, []);

    // Si es la primera carga y está loading, mostrar spinner completo
    if (isInitialLoad && isPersonasLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <InitialLoadingSpinner />
            </div>
        );
    }

    if (isPersonasError) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <ErrorState onRetry={() => refetch?.()} />
            </div>
        );
    }

    if (!Personas && !isPersonasLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <EmptyState />
            </div>
        );
    }

    const [isMobile] = useMediaQuery('(max-width: 768px)')

    return (
        <div className="flex flex-col w-full  p-2 h-screen ">
            <div className="bg-blue-200 rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full">
                {/* Header con título y botón crear - Este se mantiene estático */}
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-200 ">
                    <div className={isMobile ? "flex flex-col gap-4" : "flex items-center justify-between mb-4"}>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Listado de Personas</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Gestiona clientes, proveedores y otras personas del sistema
                            </p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Crear Persona
                        </button>
                    </div>

                    {/* Filtros - Estos también se mantienen estáticos */}
                    <div className={isMobile ? "flex flex-col-reverse mt-4 gap-4" :"flex flex-col sm:flex-row gap-4"}>
                        {/* Filtro de tipo */}
                        <div className="flex-shrink-0">
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-sm"
                                disabled={isPersonasLoading}
                            >
                                {tipoOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Buscador */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                ref={searchInputRef}
                                value={busquedaString}
                                onChange={e => setBusquedaString(e.target.value)}
                                placeholder="Buscar por nombre, código, documento..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-sm"
                                disabled={isPersonasLoading && isInitialLoad}
                            />
                            {busquedaString && (
                                <button
                                    onClick={() => setBusquedaString('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabla separada - Solo esta parte se actualiza */}
                <PersonasTable
                    personas={Personas || []}
                    isLoading={!isInitialLoad && isPersonasLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    focusedRowIndex={focusedRowIndex}
                    setFocusedRowIndex={setFocusedRowIndex}
                />

                {/* Footer con información adicional - Se mantiene estático */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                            <span>
                                Mostrando {Personas?.length || 0} {Personas?.length === 1 ? 'persona' : 'personas'}
                                {tipo > 0 && ` (${tipoOptions.find(opt => opt.value === tipo)?.label})`}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>↑↓ navegar • Enter seleccionar • Esc buscar</span>
                        </div>
                    </div>
                </div>
                <Modal
                    isOpen={isOpenEditar}
                    onClose={handleCloseEditar}
                    maxWidth="max-w-6xl"
                    backgroundColor="bg-blue-200"
                >
                    {isLoadingPersonaDetalle ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                                <span className="text-sm text-gray-600">Cargando datos de la persona...</span>
                            </div>
                        </div>
                    ) : (
                        <CrearPersonaForm personaAEditar={PersonaDetalle} />
                    )}
                </Modal>
                <Modal
                    isOpen={isOpenCrearNuevo}
                    onClose={() => setIsOpenCrearNuevo(false)}
                    maxWidth="max-w-6xl"
                    backgroundColor="bg-blue-200"
                >
                    <CrearPersonaForm />
                </Modal>
            </div>
        </div>
    );
}

export default PersonasList;