import { useGetDetallePresupuesto, useGetPresupuestosPorCliente } from "@/shared/hooks/querys/usePresupuestos";
import { PresupuestoViewModel } from "@/shared/types/presupuesto";
import Modal from "@/ui/modal/Modal";
import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, Row, Table, useReactTable } from "@tanstack/react-table";
import { useVirtualizer, VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";

// Componente de carga
const LoadingState = () => (
    <div className="flex items-center justify-center p-8 h-full">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Cargando presupuestos</p>
                <p className="text-sm text-gray-500">Por favor espere...</p>
            </div>
        </div>
    </div>
);

// Componente de error
const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
    <div className="flex items-center justify-center p-8 h-full">
        <div className="text-center max-w-md">
            <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar presupuestos</h3>
            <p className="text-gray-600 mb-6">No pudimos obtener la información. Por favor, verifica tu conexión o si el contacto asociado es cliente en el sistema.</p>
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

// Componente de estado vacío
const EmptyState = () => (
    <div className="flex items-center justify-center p-8 h-full">
        <div className="text-center max-w-md">
            <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay presupuestos disponibles</h3>
            <p className="text-gray-500">Este cliente no tiene presupuestos registrados en el sistema.</p>
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <span className="text-sm text-gray-600">Cargando ventas...</span>
        </div>
    </div>
);

const DetallePresupuestoModal = ({ presupuestoId, isOpen, onClose }: { presupuestoId: number | null; isOpen: boolean; onClose: () => void }) => {
    const { data: detallePresupuesto, isLoading: isDetallePresupuestoLoading, isError: isDetallePresupuestoError } = useGetDetallePresupuesto(presupuestoId!);

    if (!isOpen || !presupuestoId) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalles de Presupuesto #${presupuestoId}`}
            maxWidth="max-w-4xl"
        >
            <div className="p-6">
                {isDetallePresupuestoLoading ? (
                    <LoadingSpinner />
                ) : isDetallePresupuestoError ? (
                    <div className="flex flex-col items-center justify-center p-8 text-red-500">
                        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-lg font-medium">Error al cargar los detalles</p>
                        <p className="text-sm">Por favor, intenta nuevamente</p>
                    </div>
                ) : !detallePresupuesto || detallePresupuesto.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                        <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">No hay detalles disponibles</p>
                        <p className="text-sm">Esta venta no tiene artículos registrados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Artículo
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Descripción
                                    </th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Cantidad
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Precio
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Descuento
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {detallePresupuesto.map((detalle) => (
                                    <tr key={detalle.det_codigo} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                            <div>
                                                <div className="font-medium">{detalle.codbarra}</div>
                                                <div className="text-xs text-gray-500">#{detalle.art_codigo}</div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                            <div>
                                                <div>{detalle.descripcion}</div>
                                                {detalle.descripcion_editada && (
                                                    <div className="text-xs text-blue-600 italic">
                                                        "{detalle.descripcion_editada}"
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b text-center">
                                            <div>
                                                <div className="font-medium">{detalle.cantidad}</div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                            <div>
                                                <div className="font-medium">{detalle.precio.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}</div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                            {detalle.descuento.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 border-b text-right">
                                            {(detalle.precio * detalle.cantidad - detalle.descuento).toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
};


export const PresupuestosTab = ({clienteRuc}: {clienteRuc: string}) => {
    const { data: presupuestos, isLoading: isPresupuestosLoading, isError: isPresupuestosError, refetch } = useGetPresupuestosPorCliente(clienteRuc);

    const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<PresupuestoViewModel | null>(null);
    const [isOpenDetallePresupuesto, setIsOpenDetallePresupuesto] = useState(false);

    const handlePresupuestoSeleccionado = (presupuesto: PresupuestoViewModel) => {
        setPresupuestoSeleccionado(presupuesto);
        setIsOpenDetallePresupuesto(true);
    }

    const columns = useMemo<ColumnDef<PresupuestoViewModel>[]>(
        () => [
            {
                accessorKey: 'codigo',
                header: 'Código',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.codigo}</div>
                }
            },
            {
                accessorKey: 'fecha',
                header: 'Fecha',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.fecha}</div>
                }
            },
            {
                accessorKey: 'sucursal',
                header: 'Sucursal',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.sucursal || '-'}</div>
                }
            },
            {
                accessorKey: 'total',
                header: 'Total',
                cell: ({ row }) => {
                    return <div className="text-sm font-medium text-gray-900 text-right">{row.original.total}</div>
                }
            },
            {
                accessorKey: 'moneda',
                header: 'Moneda',
                cell: ({ row }) => {
                    return <div className="text-sm font-medium text-gray-900 text-right">{row.original.moneda || '-'}</div>
                }
            },
            {
                accessorKey: 'vendedor',
                header: 'Vendedor',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.vendedor || '-'}</div>
                }
            },
            {
                accessorKey: 'estado_desc',
                header: 'Estado',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.estado_desc || 'Sin estado'}</div>
                }
            },
            {
                accessorKey: 'condicion',
                header: 'Condición',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.condicion || 'Sin condición'}</div>
                }
            },
            {
                accessorKey: 'observaciones',
                header: 'Observaciones',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.obs || 'Sin observaciones'}</div>
                }
            },
            {
                accessorKey: 'pre_condicion',
                header: 'Condición de pago',
                size: 180,
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.pre_condicion || 'Sin condición de pago'}</div>
                }
            },
            {
                accessorKey: 'pre_plazo',
                header: 'Plazo',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-900">{row.original.pre_plazo || 'Sin plazo'}</div>
                }
            }
        ], [])

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const table = useReactTable({
        data: presupuestos || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })

    // Renderizar estados según la condición
    if (isPresupuestosLoading) {
        return <LoadingState />;
    }

    if (isPresupuestosError) {
        return <ErrorState onRetry={() => refetch?.()} />;
    }

    if (!presupuestos || presupuestos.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="overflow-x-auto" ref={tableContainerRef} style={{ height: '700px' }}>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-auto" style={{ display: 'grid' }}>
                <thead
                    className="bg-gray-50"
                    style={{
                        display: 'grid',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                    }}
                >
                    {table.getHeaderGroups().map((headerGroup => (
                        <tr key={headerGroup.id} style={{ display: 'flex', width: '100%' }}>
                            {headerGroup.headers.map(header => {
                                return (
                                    <th 
                                        key={header.id} 
                                        style={{ display: 'flex', width: header.getSize() }}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                                    >
                                        <div
                                            {...{
                                                className: header.column.getCanSort() ? 'cursor-pointer select-none flex items-center space-x-1' : 'flex items-center space-x-1',
                                                onClick: header.column.getToggleSortingHandler(),
                                            }}
                                        >
                                            <span>
                                                {
                                                    flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )
                                                }
                                            </span>
                                            {
                                                header.column.getIsSorted() === 'asc' ? (
                                                    <ArrowUpIcon className="w-4 h-4" />
                                                ) : header.column.getIsSorted() === 'desc' ? (
                                                    <ArrowDownIcon className="w-4 h-4" />
                                                ) : null
                                            }
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    )))}
                </thead>
                <TableBody
                    table={table}
                    tableContainerRef={tableContainerRef}
                    setPresupuestoSeleccionado={handlePresupuestoSeleccionado}
                />
            </table>
            <DetallePresupuestoModal
                presupuestoId={presupuestoSeleccionado?.codigo || null}
                isOpen={isOpenDetallePresupuesto}
                onClose={() => setIsOpenDetallePresupuesto(false)}
            />
        </div>
    )
}


interface TableBodyProps {
    table: Table<PresupuestoViewModel>
    tableContainerRef: React.RefObject<HTMLDivElement>
    setPresupuestoSeleccionado: (presupuesto: PresupuestoViewModel) => void
}

function TableBody({table, tableContainerRef, setPresupuestoSeleccionado}: TableBodyProps){
    const { rows } = table.getRowModel();


    const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        count: rows.length,
        estimateSize: () => 50,
        getScrollElement: () => tableContainerRef.current,
        measureElement:
            typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
                ? element => element.getBoundingClientRect().height
                : undefined,
        overscan: 5,
    })

    return (
        <tbody
            className="bg-white divide-y divide-gray-200"
            style={{
                display:'grid',
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative'
            }}>
                {
                    rowVirtualizer.getVirtualItems().map(virtualRow => {
                        const row = rows[virtualRow.index] as Row<PresupuestoViewModel>
                        return (
                            <TableBodyRow
                                key={row.id}
                                row={row}
                                virtualRow={virtualRow}
                                rowVirtualizer={rowVirtualizer}
                                setPresupuestoSeleccionado={setPresupuestoSeleccionado}
                            />
                        )
                    })
                }
            </tbody>
    )
}

interface TableBodyRowProps {
    row: Row<PresupuestoViewModel>
    virtualRow: VirtualItem
    rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
    setPresupuestoSeleccionado: (presupuesto: PresupuestoViewModel) => void
}

function TableBodyRow({row, virtualRow, rowVirtualizer, setPresupuestoSeleccionado}: TableBodyRowProps){
    return (
        <tr
          data-index={virtualRow.index}
          ref= {node=> rowVirtualizer.measureElement(node)}
          key={row.id}
          className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
          onClick={() => {
            setPresupuestoSeleccionado(row.original);
          }}
          style={{
            display: 'flex',
            position: 'absolute',
            transform: `translateY(${virtualRow.start}px)`,
            width: '100%'
          }}
        >
            {
                row.getVisibleCells().map(cell => {
                    return (
                        <td
                          key={cell.id}
                          className="px-4 py-3 border-b"
                          style={{
                            display: 'flex',
                            width: cell.column.getSize(),
                          }}
                        >
                            {
                                flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )
                            }
                        </td>
                    )
                })
            }
        </tr>
    )
}