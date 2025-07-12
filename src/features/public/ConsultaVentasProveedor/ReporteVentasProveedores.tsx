import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProveedorAuthStore } from "../../Login/store/ProveedorAuthStore";
import { useConsultaProveedores } from "./hooks/useConsultaProveedores";
import { ConsultaVentasProveedor } from "./types/ConsultaVentasProveedor.type";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ClienteViewModel } from "@/shared/types/clientes";
import BuscadorClientes from "@/ui/clientes/BuscadorClientes";
import { UltimasVentas } from "@/features/Ventas/components/UltimasVentas";
import { ConsultaPedidosPortable } from "@/features/Ventas/components/ConsultaPedidosPortable";

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Componente de carga mejorado
const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center py-16">
        <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 opacity-50"></div>
        </div>
        <span className="mt-4 text-gray-600 font-medium">Cargando datos...</span>
    </div>
);

// Componente de error mejorado
const ErrorMessage = () => (
    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar los datos</h3>
                <p className="mt-1 text-sm text-red-700">Por favor, verifica tu conexión e inténtalo nuevamente.</p>
            </div>
        </div>
    </div>
);

// Componente de tarjeta móvil
const MobileCard = ({ item, proEsAdmin }: { item: ConsultaVentasProveedor, proEsAdmin: number }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start mb-3">
            <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {item.descripcionProducto}
                </h3>
                <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                    Código: {item.codigoProducto}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium">{item.totalStock.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Valorización:</span>
                    <span className="font-medium text-gray-700">
                        {new Intl.NumberFormat('es-PY', {
                            style: 'currency',
                            currency: 'PYG',
                            minimumFractionDigits: 0,
                        }).format(item.valorizacion)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Precio Costo:</span>
                    <span className="font-medium text-orange-600">
                        {new Intl.NumberFormat('es-PY', {
                            style: 'currency',
                            currency: 'PYG',
                            minimumFractionDigits: 0,
                        }).format(item.precioCosto)}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">Unid. Compradas:</span>
                    <span className="font-semibold text-purple-600">{item.totalCompras.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Unid. Vendidas:</span>
                    <span className="font-semibold text-blue-600">{item.totalItems.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">% Utilidad:</span>
                    <span className="font-semibold text-green-600">
                        {proEsAdmin === 1 ? `${item.utilidad.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : '-'}
                    </span>
                </div>
            </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Importe Compra:</span>
                    <span className="font-semibold text-green-600">
                        {new Intl.NumberFormat('es-PY', {
                            style: 'currency',
                            currency: 'PYG',
                            minimumFractionDigits: 0,
                        }).format(item.totalImporte)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monto Cobrado:</span>
                    <span className="font-semibold text-emerald-600">
                        {new Intl.NumberFormat('es-PY', {
                            style: 'currency',
                            currency: 'PYG',
                            minimumFractionDigits: 0,
                        }).format(item.montoCobrado)}
                    </span>
                </div>
            </div>
        </div>
    </div>
);

// Componente de tabla virtualizada simplificado siguiendo la documentación oficial
const VirtualizedTableBody = ({ 
    table, 
    virtualizer
}: { 
    table: any; 
    tableContainerRef: React.RefObject<HTMLDivElement>;
    virtualizer: any;
}) => {
    const { rows } = table.getRowModel();

    return (
        <tbody>
            {virtualizer.getVirtualItems().map((virtualRow: any, index: number) => {
                const row = rows[virtualRow.index];
                return (
                    <tr
                        key={row.id}
                        style={{
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${
                                virtualRow.start - index * virtualRow.size
                            }px)`,
                        }}
                    >
                        {row.getVisibleCells().map((cell: any) => (
                            <td
                                key={cell.id}
                                className="border-b border-gray-100 px-3 py-2"
                                style={{
                                    width: cell.column.getSize(),
                                }}
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                );
            })}
        </tbody>
    );
};

// Componente para mostrar totales
const TableTotals = ({ data, proEsAdmin }: { data: ConsultaVentasProveedor[], proEsAdmin: number }) => {
    const totals = useMemo(() => {
        return data.reduce((acc, item) => ({
            totalStock: acc.totalStock + item.totalStock,
            totalCompras: acc.totalCompras + item.totalCompras,
            totalItems: acc.totalItems + item.totalItems,
            totalImporte: acc.totalImporte + item.totalImporte,
            montoCobrado: acc.montoCobrado + item.montoCobrado,
            valorizacion: acc.valorizacion + item.valorizacion,
            precioCosto: acc.precioCosto + item.precioCosto,
            utilidad: acc.utilidad + item.utilidad,
        }), {
            totalStock: 0,
            totalCompras: 0,
            totalItems: 0,
            totalImporte: 0,
            montoCobrado: 0,
            valorizacion: 0,
            precioCosto: 0,
            utilidad: 0,
        });
    }, [data]);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
            <div className="px-4 md:px-6 py-4">
                {/* Vista móvil: 3 columnas */}
                <div className="grid grid-cols-3 md:hidden gap-3">
                    <div className="text-center bg-white/50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Total Unidades</div>
                        <div className="text-base font-bold text-gray-900">
                            {new Intl.NumberFormat('es-PY').format(totals.totalStock)}
                        </div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Valorización</div>
                        <div className="text-base font-bold text-gray-700">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(totals.valorizacion)}
                        </div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Total Compras</div>
                        <div className="text-base font-bold text-orange-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(totals.precioCosto)}
                        </div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Unid. Compradas</div>
                        <div className="text-base font-bold text-purple-600">
                            {new Intl.NumberFormat('es-PY').format(totals.totalCompras)}
                        </div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Unid. Vendidas</div>
                        <div className="text-base font-bold text-blue-600">
                            {new Intl.NumberFormat('es-PY').format(totals.totalItems)}
                        </div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">% Utilidad</div>
                        <div className="text-base font-bold text-green-600">
                            {proEsAdmin === 1 ? `${(totals.utilidad / data.length).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : '-'}
                        </div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-3 col-span-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Total Ventas</div>
                        <div className="text-base font-bold text-green-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(totals.totalImporte)}
                        </div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-3 col-span-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Total Cobrado</div>
                        <div className="text-base font-bold text-emerald-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(totals.montoCobrado)}
                        </div>
                    </div>
                </div>

                {/* Vista desktop: 8 columnas */}
                <div className="hidden md:grid grid-cols-8 gap-4">
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Total Stock</div>
                        <div className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('es-PY').format(totals.totalStock)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Valorización</div>
                        <div className="text-lg font-bold text-gray-700">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(totals.valorizacion)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Total Compras</div>
                        <div className="text-lg font-bold text-orange-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(totals.precioCosto)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Unidades Compradas</div>
                        <div className="text-lg font-bold text-purple-600">
                            {new Intl.NumberFormat('es-PY').format(totals.totalCompras)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Unidades Vendidas</div>
                        <div className="text-lg font-bold text-blue-600">
                            {new Intl.NumberFormat('es-PY').format(totals.totalItems)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">% Utilidad Promedio</div>
                        <div className="text-lg font-bold text-green-600">
                            {proEsAdmin === 1 ? `${(totals.utilidad / data.length).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : '-'}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Total Ventas</div>
                        <div className="text-lg font-bold text-green-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(totals.totalImporte)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Total Cobrado</div>
                        <div className="text-lg font-bold text-emerald-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(totals.montoCobrado)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ConsultaVentasProveedores = () => {
    const { proveedor, token, proEsAdmin } = useProveedorAuthStore();
    const navigate = useNavigate();

    // Estados locales para las fechas
    const [fechaDesdeLocal, setFechaDesdeLocal] = useState<string>(() => {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() - 1);
        return fecha.toISOString().split('T')[0];
    });
    const [fechaHastaLocal, setFechaHastaLocal] = useState<string>(() => {
        const fecha = new Date();
        return fecha.toISOString().split('T')[0];
    });

    // Estados debounced para las consultas
    const fechaDesde = useDebounce(fechaDesdeLocal, 500);
    const fechaHasta = useDebounce(fechaHastaLocal, 500);

    // Estados para la tabla
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteViewModel | null>(null);
    const [isOpenBuscadorClientes, setIsOpenBuscadorClientes] = useState(false);

    // Estado para vista móvil
    const [isMobile, setIsMobile] = useState(false);
    const [isOpenUltimasVentas, setIsOpenUltimasVentas] = useState(false);
    const [isOpenConsultaPedidos, setIsOpenConsultaPedidos] = useState(false);

    const proveedorId = proveedor?.proCodigo ?? 0;

    const { data, isLoading, isError } = useConsultaProveedores(
        fechaDesde,
        fechaHasta,
        proveedorId,
        clienteSeleccionado?.cli_codigo ?? null
    );

    // Referencia para el contenedor de la tabla
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Memoizar los datos para evitar re-renders innecesarios
    const tableData = useMemo(() => data || [], [data]);

    // Virtualizador para la tabla
    const virtualizer = useVirtualizer({
        count: tableData.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 60,
        overscan: 20,
    });

    // Detectar viewport móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Definición de columnas mejorada con tamaños optimizados
    const columns = useMemo<ColumnDef<ConsultaVentasProveedor>[]>(
        () => [
            {
                accessorKey: 'codigoProducto',
                header: 'Código',
                size: 120,
                minSize: 100,
                maxSize: 150,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getValue<number>()}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'descripcionProducto',
                header: 'Descripción del Producto',
                size: 480,
                minSize: 300,
                maxSize: 600,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2">
                        <div 
                            className="text-sm font-medium text-gray-900"
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                            }}
                            title={getValue<string>()}
                        >
                            {getValue<string>()}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'totalStock',
                header: 'Stock',
                size: 100,
                minSize: 80,
                maxSize: 120,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2 text-center w-full">
                        <span className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('es-PY').format(getValue<number>())}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'valorizacion',
                header: 'Valorización',
                size: 100,
                minSize: 80,
                maxSize: 120,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2 text-center w-full">
                        <span className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(getValue<number>())}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'totalCompras',
                header: 'Unid. Compradas',
                size: 140,
                minSize: 120,
                maxSize: 160,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2 text-center w-full">
                        <span className="text-sm font-semibold text-purple-600">
                            {new Intl.NumberFormat('es-PY').format(getValue<number>())}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'totalImporte',
                header: 'Importe Compra',
                size: 140,
                minSize: 120,
                maxSize: 160,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2 text-right  w-full">
                        <span className="text-sm font-semibold text-green-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(getValue<number>())}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'totalItems',
                header: 'Unid. Vendidas',
                size: 100,
                minSize: 80,
                maxSize: 120,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2 text-center w-full">
                        <span className="text-sm font-semibold text-blue-600">
                            {new Intl.NumberFormat('es-PY').format(getValue<number>())}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'totalImporte',
                header: 'Importe Venta',
                size: 140,
                minSize: 120,
                maxSize: 160,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2 text-right  w-full">
                        <span className="text-sm font-semibold text-green-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(getValue<number>())}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'utilidad',
                header: '% Utilidad',
                size: 140,
                minSize: 120,
                maxSize: 160,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2 text-right w-full">
                        <span className="text-sm font-semibold text-green-600">
                            {proEsAdmin === 1 ? `${getValue<number>().toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : '-'}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'montoCobrado',
                header: 'Monto Cobrado',
                size: 140,
                minSize: 120,
                maxSize: 160,
                cell: ({ getValue }) => (
                    <div className="px-3 py-2 text-right w-full">
                        <span className="text-sm font-semibold text-emerald-600">
                            {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                                minimumFractionDigits: 0,
                            }).format(getValue<number>())}
                        </span>
                    </div>
                ),
            },
        ],
        []
    );

    // Configuración de la tabla
    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    });

    // Handlers optimizados
    const handleFechaDesdeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFechaDesdeLocal(e.target.value);
    }, []);

    const handleFechaHastaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFechaHastaLocal(e.target.value);
    }, []);

    const handleGlobalFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(e.target.value);
    }, []);

    useEffect(() => {
        if (!token || !proveedor || token === null || proveedor === null) {
            console.log("Token o datos del proveedor no válidos, redirigiendo al login");
            navigate('/proveedor-login');
            return;
        }
    }, [proveedor, token, navigate]);

    if (!token || !proveedor || token === null || proveedor === null) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-full mx-auto px-2 sm:px-2 lg:px-4 py-2">
                {/* Header mejorado */}
                <div className="mb-2">
                    <div className=" rounded-2xl shadow-sm border border-gray-200 p-2 md:p-4 bg-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h1 className="text-2xl md:text-2xl font-bold text-gray-900 mb-2">
                                    Consulta de Ventas
                                </h1>
                                <p className="text-gray-600">
                                    Analiza las ventas de tus productos en el período seleccionado
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Filtros de fecha mejorados */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha Desde
                                </label>
                                <input
                                    type="date"
                                    value={fechaDesdeLocal}
                                    onChange={handleFechaDesdeChange}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha Hasta
                                </label>
                                <input
                                    type="date"
                                    value={fechaHastaLocal}
                                    onChange={handleFechaHastaChange}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Proveedor
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={proveedor?.proRazon}
                                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1 flex justify-end">
                                {proEsAdmin === 1 && (
                                    <button  
                                    onClick={() => setIsOpenUltimasVentas(true)}
                                    className="w-full px-2 py-2 bg-blue-500 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                        <p className="text-md font-medium">Consultar Ventas</p>
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1 flex justify-end">
                                {proEsAdmin === 1 && (
                                    <button className="w-full px-2 py-2 bg-green-700 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" onClick={() => setIsOpenConsultaPedidos(true)}>
                                        <p className="text-md font-medium">Consultar Pedidos</p>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Indicador de debounce mejorado */}
                        {(fechaDesdeLocal !== fechaDesde || fechaHastaLocal !== fechaHasta) && (
                            <div className="mb-2 flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                <span className="text-sm font-medium">Actualizando datos...</span>
                            </div>
                        )}

                        {/* Filtro global mejorado */}
                        <div className="flex flex-row gap-2 w-full"    >
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar productos, códigos, importes..."
                                value={globalFilter}
                                onChange={handleGlobalFilterChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por clientes..."
                                value={clienteSeleccionado?.cli_razon || ''}
                                onFocus={() => setIsOpenBuscadorClientes(true)}
                                className={`w-full pl-10 ${clienteSeleccionado ? 'pr-12' : 'pr-4'} py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            />
                            {clienteSeleccionado && (
                                <button
                                    onClick={() => setClienteSeleccionado(null)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-red-600 transition-colors duration-200"
                                    title="Eliminar cliente seleccionado"
                                >
                                    <svg className="h-5 w-5 text-gray-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        </div>
                    </div>
                </div>

                {/* Estados de carga y error */}
                {isLoading && <LoadingSpinner />}
                {isError && <ErrorMessage />}

                {/* Contenido principal */}
                {!isLoading && !isError && (
                    <>
                        {/* Vista móvil */}
                        {isMobile ? (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                    <div className="text-sm text-gray-600 mb-2">
                                        Mostrando {table.getRowModel().rows.length} de {tableData.length} resultados
                                    </div>
                                </div>
                                <div className="max-h-screen overflow-y-auto">
                                    {table.getRowModel().rows.map((row) => (
                                        <MobileCard key={row.id} item={row.original} proEsAdmin={proEsAdmin} />
                                    ))}
                                </div>
                                {/* Totales para móvil */}
                                <TableTotals data={table.getRowModel().rows.map(r => r.original)} proEsAdmin={proEsAdmin} />
                            </div>
                        ) : (
                            /* Vista desktop con tabla virtualizada siguiendo la documentación oficial */
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div
                                    ref={tableContainerRef}
                                    className="overflow-auto"
                                    style={{
                                        height: '600px',
                                        width: '100%',
                                    }}
                                >
                                    <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
                                        <table className="w-full">
                                            <thead className="sticky top-0 z-10">
                                                {table.getHeaderGroups().map(headerGroup => (
                                                    <tr key={headerGroup.id}>
                                                        {headerGroup.headers.map(header => (
                                                            <th
                                                                key={header.id}
                                                                className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
                                                                style={{
                                                                    width: header.getSize(),
                                                                }}
                                                            >
                                                                {header.isPlaceholder ? null : (
                                                                    <div
                                                                        className={`flex items-center ${header.column.getCanSort()
                                                                                ? 'cursor-pointer select-none hover:text-blue-600 transition-colors'
                                                                                : ''
                                                                            }`}
                                                                        onClick={header.column.getToggleSortingHandler()}
                                                                    >
                                                                        {flexRender(
                                                                            header.column.columnDef.header,
                                                                            header.getContext()
                                                                        )}
                                                                        {{
                                                                            asc: ' 🔼',
                                                                            desc: ' 🔽',
                                                                        }[header.column.getIsSorted() as string] ?? null}
                                                                    </div>
                                                                )}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </thead>
                                            <VirtualizedTableBody 
                                                table={table} 
                                                tableContainerRef={tableContainerRef}
                                                virtualizer={virtualizer}
                                            />
                                        </table>
                                    </div>
                                </div>

                                {/* Totales para desktop */}
                                <TableTotals data={table.getRowModel().rows.map(r => r.original)} proEsAdmin={proEsAdmin} />

                                {/* Footer con información */}
                                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Mostrando {table.getRowModel().rows.length} de {tableData.length} resultados</span>
                                        <span className="hidden sm:inline">
                                            Última actualización: {new Date().toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <BuscadorClientes
                isOpen={isOpenBuscadorClientes}
                setIsOpen={setIsOpenBuscadorClientes}
                onSelect={setClienteSeleccionado}
            />
            <UltimasVentas
                isOpen={isOpenUltimasVentas}
                onClose={() => setIsOpenUltimasVentas(false)}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                proveedorSeleccionado={proveedor?.proCodigo}
                clienteSeleccionado={clienteSeleccionado?.cli_codigo}
            />
            <ConsultaPedidosPortable
                isOpen={isOpenConsultaPedidos}
                onClose={() => setIsOpenConsultaPedidos(false)}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                proveedorSeleccionado={proveedor?.proCodigo}
                clienteSeleccionado={clienteSeleccionado?.cli_codigo}
            />
        </div>
    );
};