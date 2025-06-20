import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { ReporteMovimientoArticulos } from "../../../shared/types/reportes";
import type { SucursalViewModel } from "../../../shared/types/sucursal";
import type { Usuario } from "../../../shared/types/auth";
import type { TotalesMovimientoArticulos } from "../../../shared/types/reportes";

interface Filtros {
    anioInicio: number
    cantidadAnios: number
    sucursal: string;
    deposito: string;
    proveedor: string;
    marca: string;
    categoria: string;
    vendedor: string;
    moneda: string;
    ciudad: string;
}

interface ReporteMovimientoProductosPdfProps {
    reporte: ReporteMovimientoArticulos
    sucursalData: SucursalViewModel
    usuarioData: Usuario
    filtros: Filtros
}

pdfMake.vfs = pdfFonts.vfs

export const ReporteMovimientoProductosPDF = ({ reporte, sucursalData, usuarioData, filtros }: ReporteMovimientoProductosPdfProps) => {
    try {
        if (!reporte || !usuarioData) {
            throw new Error("Datos del reporte o usuario no disponibles")
        }

        const { detalles, totales } = reporte

        const fechaActual = new Date().toLocaleDateString('es-PY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })

        const anios = Array.from({length: filtros.cantidadAnios}, (_, i) => filtros.anioInicio - i)
        
        // Generar encabezados dinámicos basados en la cantidad de años
        const encabezadosAnios = anios.flatMap(anio => [
            {text: `U${anio}`, style: "tableHeader"},
            {text: `I${anio}`, style: "tableHeader"}
        ])

        // Generar datos dinámicos basados en la cantidad de años
        const generarDatosAnios = (detalle: any) => {
            return anios.flatMap((_, index) => [
                {text: detalle[`cantidadAnio${index + 1}`] || 0, style: "tableCell"},
                {text: detalle[`importeAnio${index + 1}`] || 0, style: "tableCell"}
            ])
        }

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [10, 90, 10, 10],
            header: {
                stack: [
                    {
                        columns: [
                            {
                                text: `RUC: ${sucursalData?.ruc_emp || 'N/A'}`,
                                fontSize: 10,
                                bold: true,
                                margin: [0, 0, 0, 2],
                                width: '*'
                            },
                            {
                                text: `${sucursalData?.nombre_emp || 'Empresa'}`,
                                fontSize: 10,
                                bold: true,
                                margin: [0, 0, 0, 2],
                                width: '*',
                                alignment: 'center'
                            },
                            {
                                stack: [
                                    {
                                        text: `Fecha: ${fechaActual}`,
                                        fontSize: 8,
                                        margin: [0, 0, 0, 2],
                                        width: 'auto'
                                    },
                                    {
                                        text: `Usuario: ${usuarioData.op_nombre}`,
                                        fontSize: 8,
                                        margin: [0, 0, 0, 2],
                                        width: 'auto'
                                    },
                                ],
                                width: '*',
                                alignment: 'right'
                            }
                        ],
                        margin: [5, 5, 5, 5]
                    },
                    {
                        text: 'REPORTE DE MOVIMIENTO DE PRODUCTOS Y METAS - AGRUPADO POR AÑOS',
                        alignment: 'center',
                        fontSize: 12,
                        bold: true,
                        margin: [0, 5, 0, 10]
                    },
                    // Filtros primera fila
                    {
                        columns: [
                            {
                                text: `Año: ${filtros.anioInicio}`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            },
                            {
                                text: `Rango: ${filtros.cantidadAnios} años`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            },
                            {
                                text: `Sucursal: ${filtros.sucursal}`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            },
                            {
                                text: `Depósito: ${filtros.deposito}`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            },
                            {
                                text: `Proveedor: ${filtros.proveedor}`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            }
                        ],
                        margin: [10, 0, 10, 0],
                    },
                    // Filtros segunda fila
                    {
                        columns: [
                            {
                                text: `Marca: ${filtros.marca}`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            },
                            {
                                text: `Categoría: ${filtros.categoria}`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            },
                            {
                                text: `Vendedor: ${filtros.vendedor}`,  
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            },
                            {
                                text: `Moneda: ${filtros.moneda}`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            },
                            {
                                text: `Ciudad: ${filtros.ciudad}`,
                                fontSize: 8,
                                bold: true,
                                margin: [0, 0, 0, 3],
                                width: '*'
                            }
                        ],
                        margin: [10, 0, 10, 0],
                    },

                ],
            },
            content: [
                // Tabla principal
                {
                    table: {
                        headerRows: 1,
                        widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", ...Array(anios.length * 2).fill("auto"), "auto", "auto", "auto", "auto", "auto"],
                        body: [
                            // encabezados de la tabla
                            [
                                {text: "Código", style: "tableHeader"},
                                {text: "Artículo", style: "tableHeader"},
                                {text: "Stock", style: "tableHeader"},
                                {text: "Costo", style: "tableHeader"},
                                {text: "P. Contado", style: "tableHeader"},
                                {text: "P. Crédito", style: "tableHeader"},
                                {text: "P. Mostrador", style: "tableHeader"},
                                ...encabezadosAnios,
                                {text: "Dem. Prom.", style: "tableHeader"},
                                {text: "Meta", style: "tableHeader"},
                                {text: "Venta Total", style: "tableHeader"},
                                {text: 'Unid. Vend.', style: "tableHeader"},
                                {text: 'Imp. Total', style: "tableHeader"},
                            ],

                            // datos de la tabla
                            ...detalles.map((detalle) => [
                                {text: detalle.codigoArticulo?.toString() || '', style: "tableCell"},
                                {text: detalle.descripcion || '', style: "tableCell"},
                                {text: detalle.stock?.toString() || '0', style: "tableCell"},
                                {text: detalle.costo?.toLocaleString('es-PY') || '0', style: "tableCell"},
                                {text: detalle.precioVenta1?.toLocaleString('es-PY') || '0', style: "tableCell"},
                                {text: detalle.precioVenta2?.toLocaleString('es-PY') || '0', style: "tableCell"},
                                {text: detalle.precioVenta3?.toLocaleString('es-PY') || '0', style: "tableCell"},
                                ...generarDatosAnios(detalle),
                                {text: detalle.demandaPromedio?.toLocaleString('es-PY') || '0', style: "tableCell"},
                                {text: detalle.metaAcordada?.toLocaleString('es-PY') || '0', style: "tableCell"},
                                {text: detalle.ventaTotal?.toLocaleString('es-PY') || '0', style: "tableCell"},
                                {text: detalle.unidadesVendidas?.toLocaleString('es-PY') || '0', style: "tableCell"},
                                {text: detalle.importeTotal?.toLocaleString('es-PY') || '0', style: "tableCell"},
                            ])
                        ]
                    },
                    layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#aaa',
                        vLineColor: () => '#aaa',
                        paddingLeft: () => 2,
                        paddingRight: () => 2,
                        paddingTop: () => 1,
                        paddingBottom: () => 1
                    },
                    margin: [0, 10, 0, 20]
                },
                // totales
                {
                    stack: [
                        {
                            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 565, y2: 0 }]
                        },
                        {
                            text: 'RESUMEN DE TOTALES',
                            alignment: 'center',
                            fontSize: 12,
                            bold: true,
                            margin: [0, 10, 0, 10]
                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', 'auto', 'auto', 'auto'],
                                body: [
                                    [
                                        { text: 'Año', style: 'tableHeader', alignment: 'center' },
                                        { text: 'Unidades Vendidas', style: 'tableHeader', alignment: 'center' },
                                        { text: 'Importe Total', style: 'tableHeader', alignment: 'center' },
                                        { text: 'Notas de Crédito', style: 'tableHeader', alignment: 'center' }
                                    ],
                                    ...anios.map((anio, index) => [
                                        { text: anio.toString(), style: 'tableCell', alignment: 'center' },
                                        { 
                                            text: totales[`totalCantidadAnio${index + 1}` as keyof TotalesMovimientoArticulos]?.toLocaleString('es-PY') || '0', 
                                            style: 'tableCell', 
                                            alignment: 'right' 
                                        },
                                        { 
                                            text: totales[`totalImporteAnio${index + 1}` as keyof TotalesMovimientoArticulos]?.toLocaleString('es-PY') || '0', 
                                            style: 'tableCell', 
                                            alignment: 'right' 
                                        },
                                        { 
                                            text: totales[`totalNotasCreditoAnio${index + 1}` as keyof TotalesMovimientoArticulos]?.toLocaleString('es-PY') || '0', 
                                            style: 'tableCell', 
                                            alignment: 'right' 
                                        }
                                    ])
                                ]
                            },
                            layout: {
                                hLineWidth: () => 0.5,
                                vLineWidth: () => 0.5,
                                hLineColor: () => '#aaa',
                                vLineColor: () => '#aaa',
                                paddingLeft: () => 5,
                                paddingRight: () => 5,
                                paddingTop: () => 3,
                                paddingBottom: () => 3
                            },
                            margin: [0, 5, 0, 10]
                        }
                    ]
                }
            ],

            styles: {
                tableHeader: {
                    bold: true,
                    fontSize: 6,
                    color: 'black',
                    alignment: 'center',
                    fillColor: '#f0f0f0'
                },
                tableCell: {
                    fontSize: 5,
                    color: 'black'
                }
            }
        }

        return pdfMake.createPdf(docDefinition as any)
    } catch (error) {
        console.error('Error al generar PDF:', error)
        throw error
    }
}


