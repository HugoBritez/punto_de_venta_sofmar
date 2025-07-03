import { FacturaSendResponse } from "@/types/factura_electronica/types";
import { ClienteViewModel } from "@/shared/types/clientes";
import { Moneda } from "@/shared/types/moneda";
import { UsuarioViewModel } from "../types/operador";
import { DetalleVenta } from "../types/venta";

// Interfaces para los datos de entrada
export interface OpcionesFinalizacion {
  nro_establecimiento: number;
  nro_emision: number;
  nro_factura: number;
  tipo_venta: "CONTADO" | "CREDITO";
  cantidad_cuotas?: number;
  entrega_inicial?: number;
}

export interface DatosFacturaInput {
  clienteSeleccionado: ClienteViewModel;
  monedaSeleccionada: Moneda;
  vendedorSeleccionado: UsuarioViewModel;
  opcionesFinalizacion: OpcionesFinalizacion;
  totalPagarFinal: number;
  cotizacionDolar: number;
  documentoTipo: number;
  items: DetalleVenta[]; // Agregamos los items
}

/**
 * Servicio reutilizable para mapear datos de factura a FacturaSendResponse
 * Sigue los principios SOLID y KISS
 */
export class FacturaSendAdapter {
  /**
   * Mapea los datos de entrada a FacturaSendResponse
   */
  static mapearFactura(datos: DatosFacturaInput): FacturaSendResponse {
    return {
      tipoDocumento: 1,
      establecimiento: datos.opcionesFinalizacion.nro_establecimiento,
      punto: datos.opcionesFinalizacion.nro_emision,
      numero: datos.opcionesFinalizacion.nro_factura,
      observacion: "",
      fecha: new Date().toISOString().split(".")[0],
      tipoEmision: 1,
      tipoTransaccion: 1,
      tipoImpuesto: 1,
      moneda: this.mapearMoneda(datos.monedaSeleccionada),
      cambio: datos.monedaSeleccionada.moCodigo !== 1 ? datos.cotizacionDolar : 0,
      cliente: this.mapearCliente(datos.clienteSeleccionado, datos.documentoTipo),
      usuario: this.mapearUsuario(datos.vendedorSeleccionado),
      factura: {
        presencia: 1,
      },
      condicion: this.mapearCondicion(
        datos.opcionesFinalizacion,
        datos.monedaSeleccionada,
        datos.totalPagarFinal,
        datos.cotizacionDolar
      ),
      items: this.mapearItems(datos.items), // Mapeamos los items
    };
  }

  /**
   * Mapea los items de la venta con la lógica de IVA
   */
  private static mapearItems(items: DetalleVenta[]) {
    return items.map((item) => {
      // Variables para el cálculo de IVA
      let ivaTipo = 1; // Por defecto, Gravado IVA
      let ivaBase = 100;
      let ivaPorcentaje = 10;
      let IVa5 = 0;
      let IVa10 = 0;
      let vartotal = 0;
      let VGravada = 0;
      let vporc = 0;

      if (item.deveCinco > 0 && item.deveExentas > 0) {
        // CASE vcinco > 0 AND vexentas > 0
        IVa5 = Math.round((item.deveCinco / 21) * 100) / 100;
        vartotal = item.deveCinco + item.deveExentas - IVa5;
        ivaTipo = 4;
        ivaPorcentaje = 5;
        VGravada = Math.round((item.deveCinco / 1.05) * 100) / 100;
        vporc = (VGravada * 100) / vartotal;
        ivaBase = parseFloat(vporc.toFixed(8));
      } else if (item.deveDiez > 0 && item.deveExentas > 0) {
        // CASE vdiez > 0 AND vexentas > 0
        IVa10 = Math.round((item.deveDiez / 11) * 100) / 100;
        vartotal = item.deveDiez + item.deveExentas - IVa10;
        ivaTipo = 4;
        ivaPorcentaje = 10;
        VGravada = Math.round((item.deveDiez / 1.1) * 100) / 100;
        vporc = (VGravada * 100) / vartotal;
        ivaBase = parseFloat(vporc.toFixed(8));
      } else if (item.deveCinco > 0) {
        // CASE vcinco > 0
        ivaTipo = 1;
        ivaPorcentaje = 5;
        ivaBase = 100;
      } else if (item.deveDiez > 0) {
        // CASE vdiez > 0
        ivaTipo = 1;
        ivaPorcentaje = 10;
        ivaBase = 100;
      } else if (
        item.deveCinco === 0 &&
        item.deveDiez === 0 &&
        item.deveExentas > 0
      ) {
        // Caso para productos exentos
        ivaTipo = 3; // Exento
        ivaPorcentaje = 0;
        ivaBase = 0;
      }

      return {
        codigo: item.deveArticulo,
        descripcion: item.descripcion || "",
        observacion: "",
        unidadMedida: item.unidadMedida || 77,
        cantidad: item.deveCantidad,
        precioUnitario: item.devePrecio,
        descuento: item.deveDescuento || 0,
        ivaTipo: ivaTipo,
        ivaBase: ivaBase,
        iva: ivaPorcentaje,
        lote: item.lote || '',
        vencimiento: item.vencimiento || '',
      };
    });
  }

  /**
   * Mapea el código de moneda a su representación ISO
   */
  private static mapearMoneda(moneda: Moneda): string {
    const codigosMoneda: Record<number, string> = {
      1: "PYG", // Guaraníes
      2: "USD", // Dólar
      3: "BRL", // Real brasileño
      4: "ARS", // Peso argentino
    };
    
    return codigosMoneda[moneda.moCodigo] || "PYG";
  }

  /**
   * Mapea los datos del cliente
   */
  private static mapearCliente(cliente: ClienteViewModel, documentoTipo: number) {
    const esContribuyente = cliente.cli_tipo_doc === 1 || cliente.cli_tipo_doc === 18;
    
    return {
      contribuyente: esContribuyente,
      ruc: cliente.cli_tipo_doc === 1 ? cliente.cli_ruc : null,
      razonSocial: cliente.cli_razon,
      nombreFantasia: cliente.cli_descripcion,
      tipoOperacion: this.obtenerTipoOperacion(cliente.cli_tipo_doc),
      numeroCasa: "001",
      departamento: cliente.cli_departamento || 1,
      departamentoDescripcion: cliente.dep_descripcion || "",
      distrito: cliente.cli_distrito || 1,
      distritoDescripcion: cliente.cli_distrito_descripcion || "",
      direccion: cliente.cli_dir || "",
      ciudad: cliente.cli_ciudad_interno || 1,
      ciudadDescripcion: cliente.cli_ciudad_descripcion || "",
      pais: "PRY",
      paisDescripcion: "Paraguay",
      tipoContribuyente: 1,
      documentoTipo: documentoTipo,
      telefono: cliente.cli_tel || "",
      celular: cliente.cli_tel || "",
      email: cliente.cli_mail || "",
      codigo: cliente.cli_interno,
    };
  }

  /**
   * Mapea los datos del usuario/vendedor
   */
  private static mapearUsuario(vendedor: UsuarioViewModel) {
    return {
      documentoTipo: 1,
      documentoNumero: vendedor.op_documento || "",
      nombre: vendedor.op_nombre || "",
      cargo: "Vendedor",
    };
  }

  /**
   * Mapea las condiciones de pago
   */
  private static mapearCondicion(
    opciones: OpcionesFinalizacion,
    moneda: Moneda,
    totalPagar: number,
    cotizacion: number
  ) {
    const esCredito = opciones.tipo_venta === "CREDITO";
    const monedaISO = this.mapearMoneda(moneda);
    
    return {
      tipo: esCredito ? 2 : 1, // 1=Contado, 2=Crédito
      entregas: esCredito ? [] : [
        {
          tipo: 1, // Efectivo
          monto: totalPagar.toString(),
          moneda: monedaISO,
          monedaDescripcion: moneda.moDescripcion || "Guaraníes",
          cambio: moneda.moCodigo !== 1 ? cotizacion : 0,
        },
      ],
      credito: esCredito ? {
        tipo: 1, // Plazo
        plazo: `${opciones.cantidad_cuotas || 1} cuotas`,
        cuotas: opciones.cantidad_cuotas || 1,
        montoEntrega: opciones.entrega_inicial || 0,
        infoCuotas: Array.from(
          { length: opciones.cantidad_cuotas || 1 },
          () => ({
            moneda: monedaISO,
            monto: 0,
            vencimiento: "",
          })
        ),
      } : null,
    };
  }

  /**
   * Determina el tipo de operación basado en el tipo de documento del cliente
   */
  private static obtenerTipoOperacion(tipoDoc: number): number {
    switch (tipoDoc) {
      case 1: return 1; // B2B
      case 18: return 3; // B2G
      default: return 2; // B2C
    }
  }
}

/**
 * Función de conveniencia para usar el adaptador
 */
export const mapearFacturaSend = (datos: DatosFacturaInput): FacturaSendResponse => {
  return FacturaSendAdapter.mapearFactura(datos);
};