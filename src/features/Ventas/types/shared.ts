
export interface OpcionesFinalizacionVenta {
  tipo_venta: "CONTADO" | "CREDITO";
  tipo_documento: "FACTURA" | "TICKET";
  nro_factura?: string;
  nro_establecimiento?: number;
  nro_emision?: number;
  timbrado?: string;
  fecha_vencimiento?: string;
  fecha_vencimiento_timbrado?: string;
  cantidad_cuotas?: number;
  entrega_inicial?: number;
  observacion?: string;
}

export interface DocumentoBase {
    id: number;
    tipo: "VENTA" | "PEDIDO" | "PRESUPUESTO" | "REMISION";
    cliente: number;
    vendedor?: number;
    items: Array<{
      articulo: number;
      cantidad: number;
      precio: number;
      descuento?: number;
      lote?: string;
      loteid?: number;
    }>;
  }

  export interface PedidoModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export interface PresupuestoModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export interface RemisionModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export interface EditarVentaModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

  export interface VentaCliente {
    codigo: number;
    fecha: string;
    factura: string;
    total: number;
    saldo: number;
    descuento: number;
    estado: number;
    estado_desc: string;
    condicion: string;
    vendedor: string;
  }
  
  export interface DetalleVentaCliente {
    det_codigo: number;
    codbarra: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    descuento: number;
    lote: string;
  }

  type Bonificacion = "Si" | "No"

  export interface AgregarArticuloData {
    cantidad?: number,
    precio?: number,
    descuento?: number,
    bonificacion?: Bonificacion
  }
