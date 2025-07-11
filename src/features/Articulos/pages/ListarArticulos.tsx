import { useMemo, useRef, useState } from "react";
import { useListarArticulos } from "../hooks/useListarArticulos";
import { getListaParams } from "../api/getListaArticulos";
import { LoadingState, ErrorState, EmptyState } from "../components";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    Table,
    useReactTable,
} from '@tanstack/react-table'

import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import { ListaArticulo } from "../types/ListaArticulo";
import Modal from "@/ui/modal/Modal";
import { FormCrearArticulo } from "./FormCrearArticulo";

export const ListarArticulos = () => {

    const [isOpen, setIsOpen] = useState(false)

    const [params, setParams] = useState<getListaParams>({
        busqueda: "",
        estado: 1,
        marca: false,
        proveedor: false,
        categoria: false,
    })

    const { data, isLoading, isError, refetch } = useListarArticulos(params)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setParams({
            ...params,
            busqueda: e.target.value,
        })
    }

    const handleEstadoChange = (estado: number | null) => {
        setParams({
            ...params,
            estado,
        })
    }

    const handleFilterToggle = (filter: keyof Pick<getListaParams, 'marca' | 'proveedor' | 'categoria'>) => {
        // Si el filtro ya está activo, lo desactivamos (dejamos todos en false)
        if (params[filter]) {
            setParams({
                ...params,
                marca: false,
                proveedor: false,
                categoria: false,
            })
        } else {
            // Si se activa un filtro, desactivamos todos los demás
            setParams({
                ...params,
                marca: filter === 'marca',
                proveedor: filter === 'proveedor',
                categoria: filter === 'categoria',
            })
        }
    }

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const columns = useMemo<ColumnDef<ListaArticulo>[]>(
        () => {
            return [
                {
                    header: "Código",
                    accessorKey: "codigo",
                    size: 150,
                    cell: ({ row }) => {
                        return <div className="text-center px-3 py-2 text-sm font-medium text-gray-900">{row.original.codigo}</div>
                    }
                },
                {
                    header: "Descripción",
                    accessorKey: "descripcion",
                    size: 500,
                    cell: ({ row }) => {
                        return <div className="text-left px-3 py-2 text-sm text-gray-700">{row.original.descripcion}</div>
                    }
                },
                {
                    header: "Proveedor",
                    accessorKey: "proveedor",
                    size: 300,
                    cell: ({ row }) => {
                        return <div className="text-center px-3 py-2 text-sm text-gray-700">{row.original.proveedor}</div>
                    }
                },
                {
                    header: "Marca",
                    accessorKey: "marca",
                    size: 300,
                    cell: ({ row }) => {
                        return <div className="text-center px-3 py-2 text-sm text-gray-700">{row.original.marca}</div>
                    }
                },
                {
                    header: "Categoría",
                    accessorKey: "categoria",
                    size: 300,
                    cell: ({ row }) => {
                        return <div className="text-center px-3 py-2 text-sm text-gray-700">{row.original.categoria}</div>
                    }
                },
                // {
                //     header: "Cod. Acri",
                //     accessorKey: "codAcri",
                //     size: 150,
                //     cell: ({ row }) => {
                //         return <div className="text-center">{row.original.codAcri}</div>
                //     }
                // },
                {
                    header: "Iva",
                    accessorKey: "iva",
                    size: 150,
                    cell: ({ row }) => {
                        return <div className="text-center px-3 py-2 text-sm text-gray-700">{row.original.iva}</div>
                    }
                },
                {
                    header: "Tipo de Medida",
                    accessorKey: "tipoMedida",
                    size: 150,
                    cell: ({ row }) => {
                        return <div className="text-center px-3 py-2 text-sm text-gray-700">{row.original.tipoMedida}</div>
                    }
                },
                {
                    header: "Unidad de Medida",
                    accessorKey: "unidadMedida",
                    size: 150,
                    cell: ({ row }) => {
                        return <div className="text-center px-3 py-2 text-sm text-gray-700">{row.original.unidadMedida}</div>
                    }
                },
                {
                    header: "Fraccionable",
                    accessorKey: "fraccionable",
                    size: 150,
                    cell: ({ row }) => {
                        return <div className="text-center px-3 py-2 text-sm text-gray-700">{row.original.fraccionable}</div>
                    }
                }
            ]
        },
        [data]
    )

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
    })


    const renderContent = () => {
        if (isLoading) return <LoadingState message="Cargando artículos..." />
        if (isError) return <ErrorState onRetry={refetch} />
        if (!data || data.length === 0) return (
            <EmptyState
                actionButton={{
                    text: "Crear Artículo",
                    onClick: () => setIsOpen(true),
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    )
                }}
            />
        )

        return (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full h-full overflow-hidden">
                <div className="flex" ref={tableContainerRef} style={{
                    overflow: 'auto',
                    position: 'relative',
                    height: '800px',
                }}
                >
                    <table style={{ display: 'grid' }} className="w-full border-collapse">
                        <thead
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                            style={{
                                display: 'grid',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                            }}
                        >
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b border-blue-500" style={{
                                    display: 'flex',
                                    width: '100%',
                                }}
                                >
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th key={header.id} 
                                                className={`border-r border-blue-500 last:border-r-0 font-semibold text-sm py-3`}
                                                style={{
                                                    display: 'flex',
                                                    width: header.getSize(),
                                                }}
                                            >
                                                <div
                                                    className={`flex items-center justify-center w-full ${
                                                        header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-blue-600 transition-colors' : ''
                                                    }`}
                                                    {...{
                                                        onClick: header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    <span className="mr-1">
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                    </span>
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                        </svg>
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V8" />
                                                        </svg>
                                                    ) : null}
                                                </div>
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <TableBody table={table} tableContainerRef={tableContainerRef} />
                    </table>
                </div>
            </div>
        )
    }


    interface TableBodyProps {
        table: Table<ListaArticulo>
        tableContainerRef: React.RefObject<HTMLDivElement>
    }

    function TableBody({ table, tableContainerRef }: TableBodyProps) {
        const { rows } = table.getRowModel();

        const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
            count: rows.length,
            estimateSize: () => 33,
            getScrollElement: () => tableContainerRef.current,
            overscan: 5,
            measureElement:
                typeof window !== 'undefined' &&
                    navigator.userAgent.indexOf('Firefox') === -1
                    ? element => element?.getBoundingClientRect().height
                    : undefined,
        })

        return (
            <tbody
                style={{
                    display: 'grid',
                    height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
                    position: 'relative', //needed for absolute positioning of rows
                }}
            >
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = rows[virtualRow.index] as Row<ListaArticulo>
                    return (
                        <TableBodyRow
                            key={row.id}
                            row={row}
                            virtualRow={virtualRow}
                            rowVirtualizer={rowVirtualizer}
                        />
                    )
                })}
            </tbody>
        )
    }

    interface TableBodyRowProps {
        row: Row<ListaArticulo>
        virtualRow: VirtualItem
        rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
      }

      function TableBodyRow({ row, virtualRow, rowVirtualizer }: TableBodyRowProps) {
        return (
          <tr
            data-index={virtualRow.index}
            ref={node => rowVirtualizer.measureElement(node)}
            key={row.id}
            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
            style={{
              display: 'flex',
              position: 'absolute',
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }}
          >
            {row.getVisibleCells().map((cell) => {
              return (
                <td
                  key={cell.id}
                  className={`border-r border-gray-200 last:border-r-0 bg-white`}
                  style={{
                    display: 'flex',
                    width: cell.column.getSize(),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              )
            })}
          </tr>
        )
      }


    return (
        <div className="min-h-screen bg-blue-50 p-2">
            {/* Cabecera con filtros - SIEMPRE VISIBLE */}
            <div className=" shadow-sm border-b sticky top-0 z-10 rounded-md bg-blue-200">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Título y estadísticas */}
                    <div className="py-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Artículos</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Gestiona tu inventario de productos
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <button onClick={() => setIsOpen(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nuevo Artículo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="pb-4 flex flex-row items-center gap-4   w-full">
                        {/* Barra de búsqueda */}
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar artículos..."
                                value={params.busqueda}
                                onChange={handleSearch}
                                className="block w-full h-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            />
                        </div>

                        {/* Filtros adicionales */}
                        <div className="flex flex-row items-center gap-4 w-full">
                            {/* Filtro de estado */}
                            <div className="flex flex-col items-center space-x-4 border-2 border-gray-300 pr-4 rounded-md bg-white p-2">
                                <span className="text-md font-bold text-gray-700">Estado:</span>
                                <div className="flex flex-col items-start gap-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="estado"
                                            value={1}
                                            checked={params.estado === 1}
                                            onChange={(e) => handleEstadoChange(Number(e.target.value))}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-md text-gray-700">Activo</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="estado"
                                            value={0}
                                            checked={params.estado === 0}
                                            onChange={(e) => handleEstadoChange(Number(e.target.value))}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-md text-gray-700">Inactivo</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="estado"
                                            value="todos"
                                            checked={params.estado === null}
                                            onChange={() => handleEstadoChange(null)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-md text-gray-700">Todos</span>
                                    </label>
                                </div>
                            </div>

                            {/* Toggles de filtros */}
                            <div>
                                <p className="text-md font-bold text-gray-700">Filtrar por:</p>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={params.marca}
                                            onChange={() => handleFilterToggle('marca')}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-md text-gray-700">Marca</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={params.proveedor}
                                            onChange={() => handleFilterToggle('proveedor')}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-md text-gray-700">Proveedor</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={params.categoria}
                                            onChange={() => handleFilterToggle('categoria')}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-md text-gray-700">Categoría</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={!params.marca && !params.proveedor && !params.categoria}
                                            onChange={() => {
                                                // Si se activa "Artículos", desactivar todos los otros filtros
                                                setParams({
                                                    ...params,
                                                    marca: false,
                                                    proveedor: false,
                                                    categoria: false,
                                                })
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-md text-gray-700">Artículos</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido dinámico */}
            <div className="max-w-full  mx-auto py-2 h-full">
                {renderContent()}
            </div>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <FormCrearArticulo />
            </Modal>
        </div>
    )
}