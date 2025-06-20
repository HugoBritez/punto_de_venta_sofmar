import { UsuarioViewModel } from "../../types/operador";
import { useUsuarios } from "../../hooks/querys/useUsuarios";
import { useEffect, useRef, useState, useCallback } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Params {
    onSelect?: (vendedor: UsuarioViewModel) => void;
}

// Componente de loading con animación
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Cargando vendedores</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar vendedores</h3>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay vendedores disponibles</h3>
            <p className="text-gray-500">No se encontraron vendedores registrados en el sistema.</p>
        </div>
    </div>
);

export const TablaVendedores = ({ onSelect }: Params) => {
    const { data: Vendedores, isLoading, isError, refetch } = useUsuarios();
    const inputRef = useRef<HTMLInputElement>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    const columns: ColumnDef<UsuarioViewModel>[] = [
        {
            accessorKey: 'op_codigo',
            header: 'Código',
            enableSorting: true,
        },
        {
            accessorKey: 'op_nombre',
            header: 'Nombre',
            enableSorting: true,
        },
        {
            accessorKey: 'op_documento',
            header: 'Documento',
            enableSorting: true,
        },
        {
            accessorKey: 'op_rol',
            header: 'Rol',
            enableSorting: true,
        },
    ];

    const table = useReactTable({
        data: Vendedores ?? [],
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48,
        overscan: 8,
    });

    useEffect(() => {
        if (parentRef.current) {
            parentRef.current.scrollTop = 0;
        }
        rowVirtualizer.scrollToIndex(0);
    }, [globalFilter, rowVirtualizer]);

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const rows = table.getRowModel().rows;
        if (!rows.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedRowIndex(prev => Math.min(prev + 1, rows.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedRowIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                const selectedRow = rows[focusedRowIndex];
                if (selectedRow) onSelect?.(selectedRow.original);
                break;
            case 'Escape':
            case 'Tab':
                e.preventDefault();
                inputRef.current?.focus();
                break;
        }
    }, [focusedRowIndex, table, onSelect]);

    useEffect(() => {
        if (!isLoading && !isError) {
            inputRef.current?.focus();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, isLoading, isError]);

    useEffect(() => {
        setFocusedRowIndex(0);
    }, [globalFilter]);

    // Estados de la interfaz
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <LoadingSpinner />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <ErrorState onRetry={() => refetch?.()} />
            </div>
        );
    }

    if (!Vendedores?.length) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <EmptyState />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header con buscador mejorado */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        ref={inputRef}
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Buscar por nombre, código, documento o rol..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                    {globalFilter && (
                        <button
                            onClick={() => setGlobalFilter('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla mejorada */}
            <div className="overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors duration-150"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
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
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                </table>

                {/* Área virtualizada */}
                <div
                    ref={parentRef}
                    className="overflow-y-auto max-h-[400px] bg-white"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    <div style={{ height: totalSize }} className="relative w-full">
                        {virtualRows.map(virtualRow => {
                            const row = table.getRowModel().rows[virtualRow.index];
                            const isFocused = focusedRowIndex === virtualRow.index;

                            return (
                                <div
                                    key={row.id}
                                    style={{ 
                                        transform: `translateY(${virtualRow.start}px)`,
                                        height: '48px'
                                    }}
                                    className={`absolute w-full flex items-center transition-all duration-150 border-b border-gray-100 ${
                                        isFocused 
                                            ? 'bg-blue-50 shadow-inner border-blue-200 transform scale-[1.01] z-10' 
                                            : 'hover:bg-gray-50 hover:shadow-sm'
                                    } cursor-pointer group`}
                                    onClick={() => onSelect?.(row.original)}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <div key={cell.id} className="flex-1 px-6 py-3 text-sm text-gray-900">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    ))}
                                    <div className="px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer con información adicional */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                        <span>Usa ↑↓ para navegar, Enter para seleccionar</span>
                        <span>•</span>
                        <span>Esc para buscar</span>
                    </div>
                </div>
            </div>
        </div>
    );
};