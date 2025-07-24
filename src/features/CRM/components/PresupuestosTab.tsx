import { useGetPresupuestosPorCliente } from "@/shared/hooks/querys/usePresupuestos";
import { PresupuestoViewModel } from "@/shared/types/presupuesto";
import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, Row, Table, useReactTable } from "@tanstack/react-table";
import { useVirtualizer, VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";



export const PresupuestosTab = ({clienteRuc}: {clienteRuc: string}) => {
    const { data: presupuestos, isLoading: isPresupuestosLoading, isError: isPresupuestosError } = useGetPresupuestosPorCliente(clienteRuc);

    const columns = useMemo<ColumnDef<PresupuestoViewModel>[]>(
        () => [
            {
                accessorKey: 'codigo',
                header: 'Código',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-500">{row.original.codigo}</div>
                }
            },
            {
                accessorKey: 'fecha',
                header: 'Fecha',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-500">{row.original.fecha}</div>
                }
            },
            {
                accessorKey: 'sucursal',
                header: 'Sucursal',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-500">{row.original.sucursal}</div>
                }
            },
            {
                accessorKey: 'total',
                header: 'Total',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-500">{row.original.total}</div>
                }
            },
            {
                accessorKey: 'vendedor',
                header: 'Vendedor',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-500">{row.original.vendedor}</div>
                }
            },
            {
                accessorKey: 'estado_desc',
                header: 'Estado',
                cell: ({ row }) => {
                    return <div className="text-sm text-gray-500">{row.original.estado}</div>
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


    return (
        <div className="container" ref={tableContainerRef} style={{ overflow: 'auto', position: 'relative', height: '800px' }}>
            <table style={{ display: 'grid' }}>
                <thead
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
                                    <th key={header.id} style={{ display: 'flex', width: header.getSize() }}>
                                        <div
                                            {...{
                                                className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                                                onClick: header.column.getToggleSortingHandler(),
                                            }}

                                        >
                                            {
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            }
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
                />
            </table>
        </div>
    )
}


interface TableBodyProps {
    table: Table<PresupuestoViewModel>
    tableContainerRef: React.RefObject<HTMLDivElement>
}

function TableBody({table, tableContainerRef}: TableBodyProps){
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
                                row={row}
                                virtualRow={virtualRow}
                                rowVirtualizer={rowVirtualizer}
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
}

function TableBodyRow({row, virtualRow, rowVirtualizer}: TableBodyRowProps){
    return (
        <tr
          data-index={virtualRow.index}
          ref= {node=> rowVirtualizer.measureElement(node)}
          key={row.id}
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