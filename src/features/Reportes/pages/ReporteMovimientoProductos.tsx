import { useRef, useState, useEffect, useCallback } from "react";
import type { DetalleMovimientosArticulos, GetReporteMovimientoArticulosParams, TotalesMovimientoArticulos } from "../../../shared/types/reportes";
import { useGetReporteMovimientoArticulos } from "../../../shared/hooks/querys/useReportes";
import { getCoreRowModel, getSortedRowModel, getFilteredRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, flexRender } from "@tanstack/react-table";
import { useSucursales } from "../../../shared/hooks/querys/useSucursales";
import { useGetCategorias } from "../../../shared/hooks/querys/useCategorias";
import { useGetMarcas } from "../../../shared/hooks/querys/useMarcas";
import {  useUsuarios } from "../../../shared/hooks/querys/useUsuarios";
import { Autocomplete } from "../../../shared/components/Autocomplete/AutocompleteComponent";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { CategoriaViewModel } from "../../../shared/types/categoria";
import type { MarcaViewModel } from "../../../shared/types/marcas";
import type { ProveedoresViewModel } from "../../../shared/types/proveedores";
import type { SucursalViewModel } from "../../../shared/types/sucursal";
import type { DepositoViewModel } from "../../../shared/types/depositos";
import type { Ciudad } from "../../../shared/types/ciudad";
import type { UsuarioViewModel } from "../../../shared/types/operador";
import type { Moneda } from "../../../shared/types/moneda";
import { useListaDePrecios } from "../../../shared/hooks/querys/useListaDePrecios";
import { useActualizarMetaAcordada, useActualizarMetaGeneral } from "../../../shared/hooks/mutations/ventas/actualizarMeta";
import { exportarDatosAExcel } from "../../../shared/utils/exportarAExcel";
import { esAdmin, esSupervisor } from "../../../shared/utils/permisosRoles";
import { permisoVerCosto } from "../../../shared/utils/permisoVerCosto";
import { FormButtons } from "../../../shared/components/FormButtons/FormButtons";
import { ReporteMovimientoProductosPDF } from "../docs/ReporteMovimientoProductosPDF";
import { useBuscarClientes } from "../../../shared/hooks/querys/useClientes";
import { ClienteViewModel } from "@/shared/types/clientes";
import { ClientesRepository } from "@/shared/api/clientesRepository";
import { useToast } from "@chakra-ui/react";

// Función helper para obtener datos del sessionStorage
const getAuthData = () => {
    const userId = sessionStorage.getItem("user_id");
    const userName = sessionStorage.getItem("user_name");
    const userSuc = sessionStorage.getItem("user_suc");
    const rol = Number(sessionStorage.getItem("rol"));
    const permisoVerUtilidad = Number(sessionStorage.getItem("permiso_ver_utilidad"));
    
    return {
        userId,
        userName,
        userSuc,
        rol,
        permisoVerUtilidad
    };
};

const MetaAcordadaInput = ({ 
    row, 
    selectedVendedor, 
    formParams, 
    actualizarMetaAcordada,
    actualizarMetaGeneral
}: {
    row: any;
    selectedVendedor: UsuarioViewModel | null;
    formParams: GetReporteMovimientoArticulosParams;
    actualizarMetaAcordada: any;
    actualizarMetaGeneral: any;
}) => {
    const [valor, setValor] = useState(
        row.original.metaAcordada !== undefined && row.original.metaAcordada !== null
            ? String(row.original.metaAcordada)
            : ""
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const toast = useToast();

    const { rol } = getAuthData();

    useEffect(() => {
        // Solo actualizar el valor si no está en modo edición
        if (!isEditing) {
            setValor(
                row.original.metaAcordada !== undefined && row.original.metaAcordada !== null
                    ? String(row.original.metaAcordada)
                    : ""
            );
        }
    }, [row.original.metaAcordada, isEditing]);

    const guardarMeta = useCallback(async () => {
        // Validaciones
        if (valor === "" || Number(valor) < 0) {
            toast({
                title: "Valor inválido",
                description: "La meta debe ser un número mayor o igual a 0",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            setValor(
                row.original.metaAcordada !== undefined && row.original.metaAcordada !== null
                    ? String(row.original.metaAcordada)
                    : ""
            );
            setIsEditing(false);
            return;
        }

        // Evitar guardar si el valor no cambió
        const valorNumerico = Number(valor);
        if (valorNumerico === row.original.metaAcordada) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        try {
            if (!selectedVendedor) {
                console.log('Actualizando meta general 👌', valorNumerico);
                await actualizarMetaGeneral({
                    id: 0,
                    arCodigo: row.original.codigoArticulo,
                    metaGeneral: valorNumerico,
                    periodo: formParams.AnioInicio,
                    estado: 1
                });
            } else {
                await actualizarMetaAcordada({
                    id: 0,
                    articuloId: row.original.codigoArticulo,
                    operadorId: selectedVendedor?.op_codigo,
                    metaAcordada: valorNumerico,
                    periodo: formParams.AnioInicio,
                    estado: 1
                });
            }
        } catch (error) {
            // El error ya se maneja en el hook de mutación
            console.error('Error al guardar meta:', error);
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
        
    }, [valor, selectedVendedor, actualizarMetaAcordada, actualizarMetaGeneral, formParams.AnioInicio, row.original.codigoArticulo, row.original.metaAcordada, toast, isEditing]);

    // SIMPLIFICAR drásticamente los event handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValor(e.target.value);
    };

    const handleFocus = () => {
        setIsEditing(true);
        // Si el valor es "0", limpiar el input para facilitar la edición
        if (valor === "0") {
            setValor("");
        }
    };

    const handleBlur = () => {
        guardarMeta();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            guardarMeta();
            (e.currentTarget as HTMLInputElement).blur();
        }
    };

    if (!esAdmin(rol) && !esSupervisor(rol)) {
        return (
            <div className="text-center">
                {row.original.metaAcordada?.toLocaleString('es-PY', { maximumFractionDigits: 2 }) ?? ""}
            </div>
        );
    }

    return (
        <div className="relative">
            <input
                type="number"
                className={`text-center border rounded border-none focus:border focus:border-blue-700 focus:ring-1 focus:ring-blue-700 px-2 py-1 w-full bg-white ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                value={valor}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck="false"
                disabled={isSaving}
            />
            {isSaving && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                    <div className="w-4 h-4 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                </div>
            )}
        </div>
    );
};

const ReporteMovimientoProductos = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const tableContainerRef = useRef<HTMLDivElement>(null)
    
    // Usar sessionStorage directamente
    const authData = getAuthData();
    const usuario = {
        op_codigo: authData.userId,
        op_nombre: authData.userName,
        op_sucursal: authData.userSuc,
        or_rol: authData.rol
    };
    const user_id = authData.userId;

    const [formParams, setFormParams] = useState<GetReporteMovimientoArticulosParams>({
        FechaDesde: new Date(new Date().getFullYear(), 0, 1),
        FechaHasta: new Date(),
        AnioInicio: new Date().getFullYear(),
        cantidadAnios: 3,
        VendedorId: esAdmin(authData.rol) || esSupervisor(authData.rol) ? undefined : Number(user_id),
        CategoriaId: undefined,
        ClienteId: undefined,
        MarcaId: undefined,
        ArticuloId: undefined,      
        CiudadId: undefined,
        SucursalId: undefined,
        DepositoId: undefined,
        MonedaId: 1,
        ProveedorId: undefined,
        VerUtilidadYCosto: false,
        MovimientoPorFecha: false,
    })

    const [busquedaCliente,] = useState('');
    const [selectedCliente, setSelectedCliente] = useState<ClienteViewModel | null>(null);

    const { data: reporteMovimientoArticulos, isLoading, isError } = useGetReporteMovimientoArticulos(formParams);
    const { data: Sucursales, isLoading: isLoadingSucursales } = useSucursales();
    const { data: Categorias, isLoading: isLoadingCategorias, isError: isErrorCategorias } = useGetCategorias();
    const { data: Marcas, isLoading: isLoadingMarcas, isError: isErrorMarcas } = useGetMarcas();
    const { data: Vendedores, isLoading: isLoadingVendedores, isError: isErrorVendedores } = useUsuarios(undefined, 5);
    const { data: Clientes, isLoading: isLoadingClientes, isError: isErrorClientes } = useBuscarClientes(busquedaCliente);
    const { data: ListaPrecios } = useListaDePrecios();

    const [selectedSucursal, setSelectedSucursal] = useState<SucursalViewModel | null>(null);
    const [selectedDeposito, setSelectedDeposito] = useState<DepositoViewModel | null>(null);
    const [selectedProveedor, setSelectedProveedor] = useState<ProveedoresViewModel | null>(null);
    const [selectedMarca, setSelectedMarca] = useState<MarcaViewModel | null>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<CategoriaViewModel | null>(null);
    const [selectedVendedor, setSelectedVendedor] = useState<UsuarioViewModel | null>(
        esAdmin(authData.rol) || esSupervisor(authData.rol) ? null : Vendedores?.find(vendedor => vendedor.op_codigo === Number(user_id)) ?? null
    );
    const [selectedMoneda, setSelectedMoneda] = useState<Moneda | null>(null);
    const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null);

    // Agregar estado para el filtro global
    const [globalFilter, setGlobalFilter] = useState('');

    // Agregar estados de carga para los botones
    const [isLoadingExcel, setIsLoadingExcel] = useState(false);
    const [isLoadingPDF, setIsLoadingPDF] = useState(false);
    const [isLoadingLimpiar, setIsLoadingLimpiar] = useState(false);

    const handleLimpiarFiltros = async () => {
        setIsLoadingLimpiar(true);
        try {
            // Simular un pequeño delay para mostrar el estado de carga
            await new Promise(resolve => setTimeout(resolve, 300));

            setFormParams({
                FechaDesde: new Date(new Date().getFullYear(), 0, 1),
                FechaHasta: new Date(),
                AnioInicio: new Date().getFullYear(),
                cantidadAnios: 3,
                VendedorId: esAdmin(authData.rol) || esSupervisor(authData.rol) ? undefined : Number(user_id),
                CategoriaId: undefined,
                ClienteId: undefined,
                MarcaId: undefined,
                ArticuloId: undefined,
                CiudadId: undefined,
                SucursalId: undefined,
                DepositoId: undefined,
                MonedaId: 1,
                ProveedorId: undefined,
                VerUtilidadYCosto: false,
                MovimientoPorFecha: false,
            });

            // Limpiar también los selects
            setSelectedSucursal(null);
            setSelectedDeposito(null);
            setSelectedProveedor(null);
            setSelectedMarca(null);
            setSelectedCategoria(null);
            setSelectedVendedor(esAdmin(authData.rol) || esSupervisor(authData.rol) ? null : Vendedores?.find(vendedor => vendedor.op_codigo === Number(user_id)) ?? null);
            setSelectedMoneda(null);
            setSelectedCiudad(null);
            setGlobalFilter('');
        } catch (error) {
            console.error('Error al limpiar filtros:', error);
        } finally {
            setIsLoadingLimpiar(false);
        }
    };

    useEffect(() => {
    }, [reporteMovimientoArticulos?.detalles])

    // // Efecto para controlar cuándo ejecutar la consulta
    // useEffect(() => {
    //     // Solo ejecutar si hay un vendedor seleccionado
    //     const hasVendedor = selectedVendedor !== null;
    //     setShouldFetchData(hasVendedor);
    // }, [selectedVendedor]);

    const handleFiltrosChange = (nombre: string, valor: string) => {
        setFormParams({
            ...formParams,
            [nombre]: nombre === 'FechaDesde' || nombre === 'FechaHasta' 
                ? (valor && valor.length > 0 ? new Date(valor) : null)
                : valor
        })
    }

    const handleClienteSearch = async (busqueda: string) => {
        const clientes = await ClientesRepository.buscarClientes(busqueda);
        return clientes;
    }

    const handleGenerarExcel = async () => {
        if (!reporteMovimientoArticulos?.detalles || reporteMovimientoArticulos.detalles.length === 0) {
            return;
        }

        setIsLoadingExcel(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            exportarDatosAExcel(
                reporteMovimientoArticulos.detalles,
                'reporte-movimiento-articulos',
                'Reporte Articulos'
            );
        } catch (error) {
            console.error('Error al generar Excel:', error);
        } finally {
            setIsLoadingExcel(false);
        }
    };

    const handleGenerarPDF = async () => {
        if (!reporteMovimientoArticulos || !usuario) {
            return;
        }

        setIsLoadingPDF(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const filtros = {
                anioInicio: formParams.AnioInicio,
                cantidadAnios: formParams.cantidadAnios,
                sucursal: selectedSucursal?.descripcion || 'Todas',
                deposito: selectedDeposito?.dep_descripcion || 'Todos',
                proveedor: selectedProveedor?.proRazon || 'Todos',
                marca: selectedMarca?.maDescripcion || 'Todas',
                categoria: selectedCategoria?.caDescripcion || 'Todas',
                vendedor: selectedVendedor?.op_nombre || 'Todos',
                moneda: selectedMoneda?.moDescripcion || 'Todas',
                ciudad: selectedCiudad?.descripcion || 'Todas'
            };

            const pdf = ReporteMovimientoProductosPDF({
                reporte: reporteMovimientoArticulos,
                sucursalData: selectedSucursal || Sucursales?.[0] || {
                    id: 0,
                    descripcion: 'Todas las sucursales',
                    ruc_emp: 'N/A',
                    nombre_emp: 'Empresa',
                    direccion: '',
                    matriz: 0
                },
                usuarioData: usuario as unknown as UsuarioViewModel,
                filtros
            });

            pdf.download(`Reporte-Movimiento-Productos-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error al generar PDF:', error);
        } finally {
            setIsLoadingPDF(false);
        }
    };

    const { mutate: actualizarMetaAcordada } = useActualizarMetaAcordada();
    const { mutate: actualizarMetaGeneral } = useActualizarMetaGeneral();

    // Genera dinámicamente las columnas de años según cantidadAnios
    const getYearColumns = () => {
        const cols = [];
        for (let i = formParams.cantidadAnios - 1; i >= 0; i--) {
            const year = formParams.AnioInicio - i;
            cols.push(
                {
                    accessorKey: `cantidadAnio${i + 1}`,
                    header: `Unidades ${year}`,
                    size: 150,
                    cell: ({ row }: any) => (
                        <div className="text-center">
                            {row.original[`cantidadAnio${i + 1}`]?.toLocaleString('es-PY')}
                        </div>
                    ),
                },
                {
                    accessorKey: `importeAnio${i + 1}`,
                    header: `Importe ${year}`,
                    size: 180,
                    cell: ({ row }: any) => (
                        <div className="text-right">
                            {row.original[`importeAnio${i + 1}`]?.toLocaleString('es-PY')}
                        </div>
                    ),
                }
            );
        }
        return cols;
    };

    // Definición de columnas principal
    const columns: ColumnDef<DetalleMovimientosArticulos>[] = [
        {
            accessorKey: 'codigoArticulo',
            header: "Código",
            enableSorting: true,
            size: 100,
        },
        {
            accessorKey: 'descripcion',
            header: "Descripción",
            enableSorting: true,
            size: 400,
            enableColumnFilter: true,
        },
        {
            accessorKey: 'metaAcordada',
            header: `Meta ${formParams.AnioInicio}`,
            size: 150,
            enableSorting: false,
            cell: ({ row }) => (
                <MetaAcordadaInput
                    row={row}
                    selectedVendedor={selectedVendedor}
                    formParams={formParams}
                    actualizarMetaAcordada={actualizarMetaAcordada}
                    actualizarMetaGeneral={actualizarMetaGeneral}
                />
            )
        },
        {
            accessorKey: 'stock',
            header: "Stock",
            size: 120,
            cell: ({ row }) => {
                return <div className="text-center">
                    {row.original.stock.toLocaleString('es-PY')}
                </div>
            }
        },
        {
            accessorKey: 'costo',
            header: "Costo",
            size: 120,
            enableHiding: true,
            enableSorting: true,
            cell: ({ row }) => {
                if (!permisoVerCosto()) {
                    return null;
                }
                return (
                    <div className="text-right">
                        {row.original.costo.toLocaleString('es-PY')}
                    </div>
                );
            }
        },
        {
            accessorKey: 'precioVenta1',
            header: `Precio ${ListaPrecios?.[0]?.lpDescripcion ?? "Venta 1"}`,
            size: 120,
            cell: ({ row }) => {
                return (
                    <div className="text-right">
                        {row.original.precioVenta1.toLocaleString('es-PY')}
                    </div>
                );
            }
        },
        {
            accessorKey: 'precioVenta2',
            header: `Precio ${ListaPrecios?.[1]?.lpDescripcion ?? "Venta 2"}`,
            size: 120,
            cell: ({ row }) => {
                return (
                    <div className="text-right">
                        {row.original.precioVenta2.toLocaleString('es-PY')}
                    </div>
                );
            }
        },
        {
            accessorKey: 'precioVenta3',
            header: `Precio ${ListaPrecios?.[2]?.lpDescripcion ?? "Venta 3"}`,
            size: 120,
            cell: ({ row }) => {
                return (
                    <div className="text-right">
                        {row.original.precioVenta3.toLocaleString('es-PY')}
                    </div>
                );
            }
        },
        // Inserta aquí las columnas de años dinámicas
        ...getYearColumns(),
        {
            accessorKey: 'demandaPromedio',
            header: `Demanda Promedio`,
            size: 120,
            cell: ({ row }) => {
                return <div className="text-right">
                    {row.original.demandaPromedio.toLocaleString('es-PY', { maximumFractionDigits: 2 })}
                </div>
            }
        },
        {
            accessorKey: 'ventaTotal',
            header: `Venta Total`,
            size: 120,
            cell: ({ row }) => {
                return <div className="text-right">
                    {row.original.ventaTotal.toLocaleString('es-PY')}
                </div>
            }
        },
        {
            accessorKey: 'porcentajeUtilidad',
            header: `Utilidad (%)`,
            size: 120,
            cell: ({ row }) => {
                return <div className="text-right">
                    {((row.original.porcentajeUtilidad * 100).toLocaleString('es-PY', { maximumFractionDigits: 2 }))}%
                </div>
            }
        },
        {
            accessorKey: 'unidadesVendidas',
            header: `Unidades Vendidas`,
            size: 120,
            cell: ({ row }) => {
                return <div className="text-right">
                    {row.original.unidadesVendidas.toLocaleString('es-PY', { maximumFractionDigits: 2 })}
                </div>
            }
        },
        {
            accessorKey: 'importeTotal',
            header: `Importe Total`,
            size: 120,
            cell: ({ row }) => {
                return <div className="text-right">
                    {row.original.importeTotal.toLocaleString('es-PY')}
                </div>
            }
        }
    ]

    const table = useReactTable({
        data: reporteMovimientoArticulos?.detalles || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
    });

    useEffect(() => {
        if (!esAdmin(authData.rol) && !esSupervisor(authData.rol) && Vendedores && user_id) {
            const vendedor = Vendedores.find(v => v.op_codigo === Number(user_id));
            setSelectedVendedor(vendedor ?? null);
        }
    }, [Vendedores, user_id, authData.rol]);

    const TableLoadingSpinner = () => (
        <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <span className="text-sm text-gray-600">Cargando tabla...</span>
            </div>
        </div>
    );

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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar reporte</h3>
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

    const EmptyState = () => {


        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center max-w-md">
                    <div className="mb-4">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reporte disponible</h3>
                    <p className="text-gray-500">No se encontraron reportes registrados en el sistema con los filtros seleccionados.</p>
                </div>
            </div>
        );
    };

    const TableLayout = () => {
        if (isLoading) return <TableLoadingSpinner />;
        if (isError) return <ErrorState />;
        if (!reporteMovimientoArticulos?.detalles?.length) return <EmptyState />;

        const { rows } = table.getRowModel();
        const rowVirtualizer = useVirtualizer({
            count: rows.length,
            estimateSize: () => 48,
            getScrollElement: () => tableContainerRef.current,
            overscan: 8,
        });

        return (
            <div
                ref={tableContainerRef}
                className="overflow-auto max-h-[650px] bg-white"
                style={{
                    position: 'relative',
                    scrollbarWidth: 'thin',
                    willChange: 'scroll-position',
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
                    <tbody
                        style={{
                            display: 'grid',
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map(virtualRow => {
                            const row = rows[virtualRow.index];
                            return (
                                <tr
                                    key={row.id}
                                    style={{
                                        display: 'flex',
                                        position: 'absolute',
                                        transform: `translateY(${virtualRow.start}px)`,
                                        width: '100%',
                                        height: '48px'
                                    }}
                                    className="transition-all duration-150 border-b border-gray-100 hover:bg-gray-50 hover:shadow-sm group"
                                >
                                    {row?.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            style={{
                                                display: 'flex',
                                                width: cell.column.getSize(),
                                                alignItems: 'center',
                                                position: 'relative',
                                                overflow: 'visible'
                                            }}
                                            className="border-r border-gray-100 last:border-r-0 px-6 py-3 text-sm text-gray-900"
                                        >
                                            <div 
                                            className={`w-full ${
                                                // Si la celda contiene un input, no truncar
                                                cell.column.columnDef.cell && 
                                                typeof cell.column.columnDef.cell === 'function' &&
                                                cell.getValue() !== undefined &&
                                                (cell.column.id.includes('input') || cell.column.id.includes('edit'))
                                                ? '' : 'truncate'
                                            }`}
                                            title={
                                                // Solo mostrar tooltip para texto truncado
                                                cell.column.id.includes('input') || cell.column.id.includes('edit') 
                                                ? undefined 
                                                : String(cell.getValue())
                                            }
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Componente para mostrar el estado de carga de los totales
    const TotalesLoadingState = () => (
        <div className="flex flex-row-reverse gap-4 p-4">
            {[1, 2, 3].map((index) => (
                <div key={index} className="flex flex-col gap-2">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex flex-row gap-2 items-center justify-end">
                            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md">
                            </div>
                            <div className="h-8 w-56 bg-amber-200 animate-pulse rounded-md flex flex-row gap-2 items-center justify-end">
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    // Componente para mostrar los totales
    const TotalesContent = ({
        totales,
        anioInicio,
        cantidadAnios
    }: {
        totales: TotalesMovimientoArticulos,
        anioInicio: number,
        cantidadAnios: number
    }) => (
        <div className="flex flex-row-reverse gap-4 p-4">
            {Array.from({ length: cantidadAnios }, (_, i) => {
                const index = i + 1;
                const year = anioInicio - i;
                return (
                    <div key={index} className="flex flex-col gap-2 bg-white rounded-md p-2">
                        <div className="flex flex-row gap-2 items-center justify-end">
                            <span className="font-bold text-slate-700 text-md">Total Importe {year}:</span>
                            <span className="text-slate-800  rounded-md p-2  font-medium text-md">
                                {totales[`totalImporteAnio${index}` as keyof TotalesMovimientoArticulos]?.toLocaleString('es-PY') ?? ""}
                            </span>
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-end">
                            <span className="font-bold text-slate-700 text-md">Total unid. vendidas {year}:</span>
                            <span className="text-slate-800  rounded-md p-2  font-medium text-md">
                                {totales[`totalCantidadAnio${index}` as keyof TotalesMovimientoArticulos]?.toLocaleString('es-PY', { maximumFractionDigits: 0 }) ?? ""}
                            </span>
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-end">
                            <span className="font-bold text-slate-700 text-md">Total Nota de credito {year}:</span>
                            <span className="text-slate-800  rounded-md p-2  font-medium text-md">
                                {totales[`totalNotasCreditoAnio${index}` as keyof TotalesMovimientoArticulos]?.toLocaleString('es-PY') ?? ""}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-32px)] p-1">
            <div className="p-2 bg-blue-200 rounded-md h-[10%] flex flex-row gap-4">
                <div className="grid grid-cols-6 gap-2 w-[85%] relative" style={{ zIndex: 1000 }}>
                    <div className="flex flex-row gap-2 h-full items-start w-full">
                        <div className="flex flex-col gap-1 w-full">
                        <label htmlFor="fechaDesde" className="text-slate-800 text-sm">Fecha desde</label>
                        <input type="date" id="fechaDesde" className="bg-white rounded-md p-2 border  h-10"
                            value={formParams.FechaDesde?.toISOString().split('T')[0] || ''}
                            onChange={(e) => handleFiltrosChange('FechaDesde', e.target.value)}
                        />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                        <label htmlFor="fechaHasta" className="text-slate-800 text-sm">Fecha hasta</label>
                        <input type="date" id="fechaHasta" className="bg-white rounded-md p-2 border  h-10"
                            value={formParams.FechaHasta?.toISOString().split('T')[0] || ''}
                            onChange={(e) => handleFiltrosChange('FechaHasta', e.target.value)}
                        />
                        </div>
                    </div>
                    
                    <Autocomplete<MarcaViewModel>
                        data={Marcas || []}
                        value={selectedMarca || null}
                        onChange={(marca) => {
                            setSelectedMarca(marca);
                            handleFiltrosChange('MarcaId', marca?.maCodigo.toString() || '');
                        }}
                        displayField="maDescripcion"
                        searchFields={["maDescripcion", "maCodigo"]}
                        additionalFields={[
                            { field: "maCodigo", label: "Codigo" },
                            { field: "maDescripcion", label: "Marca" }
                        ]}
                        label="Marca"
                        isLoading={isLoadingMarcas}
                        isError={isErrorMarcas}
                        errorMessage="Error al cargar las marcas"
                        disabled={isLoadingSucursales}
                    />
                    <Autocomplete<CategoriaViewModel>
                        data={Categorias || []}
                        value={selectedCategoria || null}
                        onChange={(categoria) => {
                            setSelectedCategoria(categoria);
                            handleFiltrosChange('CategoriaId', categoria?.caCodigo.toString() || '');
                        }}
                        displayField="caDescripcion"
                        searchFields={["caDescripcion", "caCodigo"]}
                        additionalFields={[
                            { field: "caCodigo", label: "Codigo" },
                            { field: "caDescripcion", label: "Categoria" }
                        ]}
                        label="Categoria"
                        isLoading={isLoadingCategorias}
                        isError={isErrorCategorias}
                        errorMessage="Error al cargar las categorias"
                        disabled={isLoadingCategorias}
                    />
                    <Autocomplete<UsuarioViewModel>
                        data={Vendedores || []}
                        value={selectedVendedor || null}
                        onChange={(vendedor) => {
                            setSelectedVendedor(vendedor);
                            handleFiltrosChange('VendedorId', vendedor?.op_codigo.toString() || '');
                        }}
                        displayField="op_nombre"
                        searchFields={["op_nombre", "op_codigo"]}
                        additionalFields={[
                            { field: "op_codigo", label: "Codigo" },
                            { field: "op_nombre", label: "Vendedor" }
                        ]}
                        label="Vendedor"
                        isLoading={isLoadingVendedores}
                        isError={isErrorVendedores}
                        errorMessage="Error al cargar los vendedores"
                        disabled={isLoadingVendedores || (!esAdmin(authData.rol) && !esSupervisor(authData.rol))}
                        id="vendedor"
                        defaultId={
                            !esAdmin(authData.rol) && !esSupervisor(authData.rol)
                                ? user_id?.toString()
                                : undefined
                        }
                        idField="op_codigo"
                    />
                    <Autocomplete<ClienteViewModel>
                        data={Clientes || []}
                        value={selectedCliente || null}
                        onChange={(cliente) => {
                            handleFiltrosChange('ClienteId', cliente?.cli_codigo.toString() || '');
                            setSelectedCliente(cliente);
                        }}
                        displayField="cli_razon"
                        searchFields={["cli_razon", "cli_codigo"]}
                        additionalFields={[
                            { field: "cli_codigo", label: "Codigo" },
                            { field: "cli_razon", label: "Cliente" }
                        ]}
                        label="Cliente"
                        isLoading={isLoadingClientes}
                        isError={isErrorClientes}
                        errorMessage="Error al cargar los clientes"
                        disabled={isLoadingClientes}
                        id="cliente"
                        idField="cli_codigo"
                        onSearch={handleClienteSearch}
                    />
                    {/* <Autocomplete<ProveedoresViewModel>
                        data={Proveedores || []}
                        value={selectedProveedor || null}
                        onChange={(proveedor) => {
                            setSelectedProveedor(proveedor);
                            handleFiltrosChange('ProveedorId', proveedor?.proCodigo.toString() || '');
                        }}
                        displayField="proRazon"
                        searchFields={["proRazon", "proCodigo"]}
                        additionalFields={[
                            { field: "proCodigo", label: "Codigo" },
                            { field: "proRazon", label: "Proveedor" }
                        ]}
                        label="Proveedor"
                        isLoading={isLoadingProveedores}
                        isError={isErrorProveedores}
                        errorMessage="Error al cargar los proveedores"
                        disabled={isLoadingSucursales}
                        onSearch={handleProveedorSearch}
                    /> */}
                    {/* <Autocomplete<Moneda>
                        data={Monedas || []}
                        value={selectedMoneda || null}
                        onChange={(moneda) => {
                            setSelectedMoneda(moneda);
                            handleFiltrosChange('MonedaId', moneda?.moCodigo.toString() || '');
                        }}
                        displayField="moDescripcion"
                        searchFields={["moDescripcion", "moCodigo"]}
                        additionalFields={[
                            { field: "moCodigo", label: "Codigo" },
                            { field: "moDescripcion", label: "Moneda" }
                        ]}
                        label="Moneda"
                        isLoading={isLoadingMonedas}
                        isError={isErrorMonedas}
                        errorMessage="Error al cargar las monedas"
                        disabled={isLoadingMonedas}
                        id="moneda"
                        defaultId={1}
                        idField="moCodigo"
                    /> */}
                    {/* <Autocomplete<Ciudad        >
                        data={Ciudades || []}
                        value={selectedCiudad || null}
                        onChange={(ciudad) => {
                            setSelectedCiudad(ciudad);
                            handleFiltrosChange('CiudadId', ciudad?.id.toString() || '');
                        }}
                        displayField="descripcion"
                        searchFields={["descripcion", "id"]}
                        additionalFields={[
                            { field: "id", label: "Codigo" },
                            { field: "descripcion", label: "Ciudad" }
                        ]}
                        label="Ciudad"
                        isLoading={isLoadingCiudades}
                        isError={isErrorCiudades}
                        errorMessage="Error al cargar las ciudades"
                        disabled={isLoadingCiudades}
                    /> */}
                    <div className="relative  rounded-md  flex flex-col gap-2 items-center justify-center">
                        <input
                            type="text"
                            placeholder="Buscar por  descripción o cód de barras..."
                            value={globalFilter ?? ''}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="bg-white w-full p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col  w-[15%] justify-center h-full">
                    <div className="flex flex-row gap-2">
                        <select className="bg-white rounded-md p-2 border border-blue-700"
                            value={formParams.cantidadAnios}
                            onChange={(e) => handleFiltrosChange('cantidadAnios', e.target.value)}>
                            <option value="Cantidad de años">Años</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                        <select
                            className="bg-white rounded-md p-2 border border-blue-700"
                            value={formParams.AnioInicio}
                            onChange={(e) => handleFiltrosChange('AnioInicio', e.target.value)}
                        >
                            <option value="">Select año</option>
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((anio) => (
                                <option key={anio} value={anio}>
                                    {anio}
                                </option>
                            ))}
                        </select>
                    </div>
                    <FormButtons
                        onClickExcel={handleGenerarExcel}
                        onClickPDF={handleGenerarPDF}
                        onClickLimpiar={handleLimpiarFiltros}
                        isLoading={{
                            excel: isLoadingExcel,
                            pdf: isLoadingPDF,
                            limpiar: isLoadingLimpiar
                        }}
                    />
                    
                </div>

            </div>
            <div className="bg-white flex-1 min-h-0 rounded-md flex flex-col gap-4 p-4">
                <div className="flex-1 min-h-0 overflow-hidden">
                    <TableLayout />
                </div>
            </div>
            <div className="bg-blue-200 max-h-[20%] rounded-md">
                {isLoading ? (
                    <TotalesLoadingState />
                ) : isError ? (
                    <div className="flex items-center justify-center p-4">
                        <span className="text-red-600">Error al cargar los totales</span>
                    </div>
                ) : reporteMovimientoArticulos?.totales ? (
                    <TotalesContent
                        totales={reporteMovimientoArticulos.totales}
                        anioInicio={formParams.AnioInicio}
                        cantidadAnios={formParams.cantidadAnios}
                    />
                ) : null}
            </div>
        </div>
    )
}

export default ReporteMovimientoProductos;

