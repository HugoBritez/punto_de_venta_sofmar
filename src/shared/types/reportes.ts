export interface PedidosFacturadosProps {
    fechaDesde: string;
    fechaHasta: string;
    articulo?: number;
    vendedor?: number;
    cliente?: number;
    sucursal?: number;
}

export interface PedidosFacturadosViewModel {
    nroPedido: number;
    vendedor: string;
    codCliente: string;
    nombreCliente: string;
    codProducto: string;
    producto: string;
    marca: string;
    cantidadPedido: number;
    cantidadFacturada: number;
    cantidadFaltante: number;
    totalPedido: number;
    totalVenta: number;
    diferenciaTotal: number;
    fechaPedido: string;
}


export interface GetReporteMovimientoArticulosParams {
    AnioInicio: number;
    cantidadAnios: number;
    VendedorId?: number;
    CategoriaId?: number;
    ClienteId?: number;
    MarcaId?: number;
    ArticuloId?: number;
    CiudadId?: number;
    SucursalId?: number;
    DepositoId?: number;
    MonedaId?: number;
    ProveedorId?: number;
    VerUtilidadYCosto?: boolean;
    MovimientoPorFecha?: boolean;
}

export interface ReporteMovimientoArticulos {
    totales: TotalesMovimientoArticulos;
    detalles: DetalleMovimientosArticulos[];
}

export interface TotalesMovimientoArticulos {
    totalCantidadAnio1: number;
    totalImporteAnio1: number;
    totalCantidadAnio2: number;
    totalImporteAnio2: number;
    totalCantidadAnio3: number;
    totalImporteAnio3: number;
    totalCantidadAnio4: number;
    totalImporteAnio4: number;
    totalCantidadAnio5: number;
    totalImporteAnio5: number;
    totalNotasCreditoAnio1: number;
    totalNotasCreditoAnio2: number;
    totalNotasCreditoAnio3: number;
    totalNotasCreditoAnio4: number;
    totalNotasCreditoAnio5: number;
}


export interface DetalleMovimientosArticulos {
    codigoArticulo: number;
    descripcion: string;
    codigoBarras: string;
    stock: number;
    costo: number;
    precioVenta1: number;
    precioVenta2: number;
    precioVenta3: number;
    cantidadAnio1: number;
    importeAnio1: number;
    cantidadAnio2: number;
    importeAnio2: number;
    cantidadAnio3: number;
    importeAnio3: number;
    cantidadAnio4?: number;
    importeAnio4?: number;
    cantidadAnio5?: number;
    importeAnio5?: number;
    cantidad: number;
    importe: number;
    demandaPromedio: number;
    metaAcordada: number;
    ventaTotal: number; // el monto total de las ventas basadas en la meta establecida
    unidadesVendidas: number; //sumatoria de las unidades vendidas de los ultimos 3 anios
    importeTotal: number; //sumatoria de los importes de los ultimos 3 anios
}

