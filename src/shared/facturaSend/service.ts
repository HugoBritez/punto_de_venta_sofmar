import axios from "axios";
import { FacturaSendRepository } from "./repo";
import { FacturaSendResponse } from "@/types/factura_electronica/types";
import { DetalleVenta, Venta } from "../types/venta";
import { DatosFacturaInput, mapearFacturaSend } from "./FacturaSendAdapter";
import { ClienteViewModel } from "../types/clientes";
import { Moneda } from "../types/moneda";
import { UsuarioViewModel } from "../types/operador";
import { DatosFacturacion } from "../api/facturasApi";

// Tipos para el resultado del envío
export interface FacturaSendResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

// Tipos para los errores de FacturaSend
export interface FacturaSendError {
    error: string;
    index: number;
}

export interface FacturaSendErrorResponse {
    success: false;
    error: string;
    errores: FacturaSendError[];
}

export interface FacturaSendSuccessResponse {
    success: true;
    result: {
        deList: Array<{
            qr: string;
            cdc: string;
        }>;
    };
}

export class FacturaSendService {
    private static async usaFacturaElectronica(sucursal_id: number) {
        const response = await FacturaSendRepository.verificarEmpresaUsaFacturaElectronica(sucursal_id);
        return response;
    }

    private static async obtenerParametrosFacturaSend() {
        const response = await FacturaSendRepository.obtenerParametrosFacturaSend();
        
        return response;
    }

    private static async enviarFactura(data: FacturaSendResponse, sucursal_id: number): Promise<FacturaSendSuccessResponse | FacturaSendErrorResponse | null> {
        try {
            const usaFacturaElectronica = await this.usaFacturaElectronica(sucursal_id);

            console.log('usaFacturaElectronica response', usaFacturaElectronica)

            if (usaFacturaElectronica) {
                console.log('Cliente usa factura electronica ✅', usaFacturaElectronica)
                const dataFacturaSend = await this.obtenerParametrosFacturaSend();
                console.log('datos de factura send', dataFacturaSend)
                if (dataFacturaSend) {
                    const apiUrl = dataFacturaSend.parametros[0].api_url_crear;
                    const apiKey = dataFacturaSend.parametros[0].api_key;
                    const authHeader = `Bearer api_key_${apiKey}`;

                    console.log('fetcheando a factura send ...')

                    const response = await axios.post(apiUrl, [data], {
                        headers: {
                            'Authorization': authHeader,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('response factura send', response.data);

                    // Verificar si la respuesta indica un error
                    if (response.data.success === false) {
                        console.error('Error en FacturaSend:', response.data);
                        return response.data as FacturaSendErrorResponse;
                    }

                    return response.data as FacturaSendSuccessResponse;
                }
            }
            console.log('no usa factura electronica ❌')
            return null;
        } catch (error) {
            console.error("Error al enviar factura electrónica:", error);
            throw error;
        }
    }

    private static async actualizarVentaConFacturaElectronica(venta: Venta, responseFactura: FacturaSendSuccessResponse) {
        try {
            // Extraer QR y CDC de la respuesta
            const qr = responseFactura.result?.deList?.[0]?.qr;
            const cdc = responseFactura.result?.deList?.[0]?.cdc;

            if (qr && cdc) {
                // Actualizar la venta con los datos de facturación electrónica
                const ventaActualizada = {
                    ...venta,
                    qr: qr,
                    cdc: cdc,
                    factura_electronica_enviada: true
                };
                
                return ventaActualizada;
            }

            return venta;
        } catch (error) {
            console.error("Error al actualizar venta con factura electrónica:", error);
            return venta;
        }
    }

    private static procesarErroresFacturaSend(errorResponse: FacturaSendErrorResponse): string {
        const errores = errorResponse.errores || [];
        const mensajes = errores.map(err => `Error ${err.index + 1}: ${err.error}`).join('; ');
        
        return `Error en FacturaSend: ${errorResponse.error}. ${mensajes}`;
    }

    public static async vender(
        venta: Venta,
        detalle: DetalleVenta[],
        clienteSeleccionado: ClienteViewModel,
        monedaSeleccionada: Moneda,
        cajero: UsuarioViewModel,
        datosFacturacionData: DatosFacturacion,
        totales: number,
        entregaInicial: number
    ): Promise<{ venta: Venta; error?: string }> {
        try {
            const datosFacturaInput: DatosFacturaInput = {
                clienteSeleccionado: clienteSeleccionado,
                monedaSeleccionada: monedaSeleccionada,
                vendedorSeleccionado: cajero,
                opcionesFinalizacion: {
                    nro_establecimiento: Number(datosFacturacionData.d_Establecimiento),
                    nro_emision: Number(datosFacturacionData.d_P_Emision),
                    nro_factura: Number(datosFacturacionData.d_Nro_Secuencia) + 1,
                    tipo_venta: venta.credito === 1 ? "CREDITO" : "CONTADO",
                    cantidad_cuotas: venta.cantCuotas,
                    entrega_inicial: entregaInicial
                },
                totalPagarFinal: totales,
                cotizacionDolar: 0,
                documentoTipo: 1,
                items: detalle
            };

            const datosFactura = mapearFacturaSend(datosFacturaInput);

            // Enviar factura electrónica
            const responseFactura = await this.enviarFactura(datosFactura, venta.sucursal);

            // Procesar la respuesta
            if (responseFactura) {
                if (responseFactura.success === false) {
                    // Error en FacturaSend
                    const mensajeError = this.procesarErroresFacturaSend(responseFactura);
                    console.error(mensajeError);
                    return { venta, error: mensajeError };
                } else {
                    // Éxito en FacturaSend
                    const ventaActualizada = await this.actualizarVentaConFacturaElectronica(venta, responseFactura);
                    return { venta: ventaActualizada };
                }
            }

            // Si no se pudo enviar la factura electrónica, devolver la venta original
            return { venta };

        } catch (error) {
            console.error("Error en el proceso de venta:", error);
            const mensajeError = error instanceof Error ? error.message : 'Error desconocido en el proceso de venta';
            return { venta, error: mensajeError };
        }
    }
}