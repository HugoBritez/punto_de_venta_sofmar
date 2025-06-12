import { PedidosFacturadosProps } from "@/repos/reportesRepository"
import { usePedidosFacturados } from "@/shared/hooks/queries/useReportes"
import { useMemo, useState, useRef } from "react"
import { ColumnDef, useReactTable, getSortedRowModel, getCoreRowModel, flexRender, getFilteredRowModel, ColumnFiltersState } from "@tanstack/react-table"
import {  useVirtualizer } from "@tanstack/react-virtual"
import { debounce } from "lodash"
import { generarExcelReportePedidosFacturados } from "../utils/importarAExcel"

// Componente de loading con animación
const TableLoadingSpinner = () => (
    <div className="flex items-center justify-center p-8 h-full">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <span className="text-2xl text-gray-600 font-medium">Cargando reporte...</span>
        </div>
    </div>
);

// Componente de error
const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
    <div className="flex items-center justify-center p-12 h-full">
        <div className="text-center max-w-md">
            <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar el reporte</h3>
            <p className="text-gray-500 text-lg mb-6">No pudimos obtener la información. Por favor, verifica tu conexión e intenta nuevamente.</p>
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
    <div className="flex items-center justify-center p-12 h-full">
        <div className="text-center max-w-md">
            <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-500 text-lg">No se encontraron pedidos facturados para los criterios seleccionados.</p>
        </div>
    </div>
);

const ReportePedidosFacturados = () => {
  const [params, setParams] = useState<PedidosFacturadosProps>({
    fechaDesde: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    articulo: undefined,
    vendedor: undefined,
    cliente: undefined,
    sucursal: undefined,
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data: reporte, isLoading, isError, refetch } = usePedidosFacturados(params)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [focusedRowIndex, setFocusedRowIndex] = useState(0)

  const debouncedHandleChange = useMemo(
    () =>
      debounce((input: string, value: string) => {
        setParams(prev => ({ ...prev, [input]: value }))
      }, 500),
    []
  )

  const handleChange = (input: string, value: string) => {
    debouncedHandleChange(input, value)
  }

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'nroPedido',
      header: "Nro. Pedido",
      enableSorting: true,
      size: 100,
      enableColumnFilter: true,
    },
    {
      accessorKey: "nombreCliente",
      header: "Cliente",
      enableSorting: true,
      size: 300,
      enableColumnFilter: true,
    },
    {
      accessorKey: "fechaPedido",
      header: "Fecha",
      enableSorting: true,
      size: 150,
    },
    {
      accessorKey: "codProducto",
      header: "Código",
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "producto",
      header: "Producto",
      enableSorting: true,
      size: 300,
    },
    {
      accessorKey: "marca",
      header: "Marca",
      enableColumnFilter: true,
      enableSorting: true,
      size: 150,
    },
    {
      accessorKey: "cantidadPedido",
      header: "Cant. Pedido",
      enableSorting: true,
      size: 120,
    },
    {
      accessorKey: "cantidadFacturada",
      header: "Cant. Facturada",
      enableSorting: true,
      size: 120,
    },
    {
      accessorKey: "cantidadFaltante",
      header: "Cant. Faltante",
      enableSorting: true,
      size: 120,
    },
    {
      accessorKey: "vendedor",
      header: "Vendedor",
      enableSorting: true,
      size: 200,
    },
    {
      accessorKey: "totalPedido",
      header: "Total Pedido",
      enableSorting: true,
      size: 150,
      cell: ({ row }) => {
        const total = row.original.totalPedido
        return new Intl.NumberFormat('es-PY', {
          style: 'currency',
          currency: 'PYG'
        }).format(total)
      }
    },
    {
      accessorKey: "totalVenta",
      header: "Total Venta",
      enableSorting: true,
      size: 150,
      cell: ({ row }) => {
        const total = row.original.totalVenta
        return new Intl.NumberFormat('es-PY', {
          style: 'currency',
          currency: 'PYG'
        }).format(total)
      }
    },
    {
      accessorKey: "diferenciaTotal",
      header: "Diferencia",
      enableSorting: true,
      size: 150,
      cell: ({ row }) => {
        const total = row.original.diferenciaTotal
        return new Intl.NumberFormat('es-PY', {
          style: 'currency',
          currency: 'PYG'
        }).format(total)
      }
    },
  ], [])

  const table = useReactTable({
    data: reporte || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 48,
    getScrollElement: () => tableContainerRef.current,
    overscan: 8,
  })

  const handleExportExcel = () => {
    if (reporte && reporte.length > 0) {
      generarExcelReportePedidosFacturados(reporte);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen p-2">
      <div className="flex flex-col w-full h-full bg-white rounded-lg ">
        {/* Cabecera - SIEMPRE visible */}
        <div className="bg-blue-200 rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-4">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Reporte de Pedidos Facturados</h1>
            <p className="text-sm text-gray-600 mt-1">
              Filtra y visualiza los pedidos facturados del sistema
            </p>
            
            {/* Filtros de fecha con debounce */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                <input 
                  type="date" 
                  value={params.fechaDesde} 
                  onChange={(e) => handleChange("fechaDesde", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <input 
                  type="date" 
                  value={params.fechaHasta} 
                  onChange={(e) => handleChange("fechaHasta", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Filtros de columna */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
              {table.getColumn('nombreCliente') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Cliente</label>
                  <input
                    type="text"
                    value={(table.getColumn('nombreCliente')?.getFilterValue() as string) ?? ''}
                    onChange={(e) => table.getColumn('nombreCliente')?.setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Buscar cliente..."
                  />
                </div>
              )}
              {table.getColumn('vendedor') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Vendedor</label>
                  <input
                    type="text"
                    value={(table.getColumn('vendedor')?.getFilterValue() as string) ?? ''}
                    onChange={(e) => table.getColumn('vendedor')?.setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Buscar vendedor..."
                  />
                </div>
              )}
              {table.getColumn('producto') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Producto</label>
                  <input
                    type="text"
                    value={(table.getColumn('producto')?.getFilterValue() as string) ?? ''}
                    onChange={(e) => table.getColumn('producto')?.setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Buscar producto..."
                  />
                </div>
              )}
              {table.getColumn('marca') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Marca</label>
                  <input
                    type="text"
                    value={(table.getColumn('marca')?.getFilterValue() as string) ?? ''}
                    onChange={(e) => table.getColumn('marca')?.setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Buscar marca..."
                  />
                </div>
              )}
              <div className="flex justify-end">
                <button 
                  onClick={handleExportExcel}
                  disabled={!reporte || reporte.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    !reporte || reporte.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-700 hover:bg-green-800'
                  } text-white transition-colors duration-200`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-bold">Exportar a Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla - Condicional */}
        <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
          {isLoading ? (
            <TableLoadingSpinner />
          ) : isError ? (
            <ErrorState onRetry={() => refetch?.()} />
          ) : !reporte || reporte.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex-1 overflow-hidden h-full">
              <div
                ref={tableContainerRef}
                className="overflow-auto h-full min-h-[1000px] bg-white"
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
                  <tbody
                    style={{
                      display: 'grid',
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                      const row = rows[virtualRow.index]
                      const isFocused = focusedRowIndex === virtualRow.index

                      return (
                        <tr
                          key={row.id}
                          onClick={() => setFocusedRowIndex(virtualRow.index)}
                          style={{
                            display: 'flex',
                            position: 'absolute',
                            transform: `translateY(${virtualRow.start}px)`,
                            width: '100%',
                            height: '48px'
                          }}
                          className={`transition-all duration-150 border-b border-gray-100 ${
                            isFocused
                              ? 'bg-blue-50 shadow-inner border-blue-200 transform scale-[1.01] z-10'
                              : 'hover:bg-gray-50 hover:shadow-sm'
                          } group`}
                        >
                          {row.getVisibleCells().map(cell => (
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
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer - SIEMPRE visible */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 mt-4 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>
                Mostrando {reporte?.length || 0} {reporte?.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span>↑↓ navegar • Enter seleccionar • Esc buscar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportePedidosFacturados