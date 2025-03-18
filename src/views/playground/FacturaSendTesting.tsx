import { useState } from "react";
import { DatosFacturaElectronica, FacturaSendResponse } from "@/types/factura_electronica/types";
import { useFacturaSendTesting } from "@/hooks/useFacturaSendTesting";

const FacturaSend = () => {
  const [isLoading, ] = useState(false);
  const [parametrosResponse, ] =
    useState<DatosFacturaElectronica | null>(null);
  const [error, ] = useState<string | null>(null);

  const {enviarFactura } = useFacturaSendTesting();

  const datoDePrueba: FacturaSendResponse = {
    tipoDocumento: 1, // Factura electrónica
    establecimiento: 1, // Como número, no como string
    punto: "001",
    numero: 1, // Como número, no como string
    descripcion: "Factura de prueba",
    observacion: "Esta es una factura de prueba para integración",
    fecha: new Date().toISOString().split(".")[0], // Formato: YYYY-MM-DDTHH:MM:SS
    tipoEmision: 1, // Normal
    tipoTransaccion: 1, // Venta de mercaderías
    tipoImpuesto: 1, // IVA
    moneda: "PYG", // Guaraní paraguayo
    cliente: {
      contribuyente: true,
      ruc: "80012345-6",
      razonSocial: "Empresa de Prueba S.A.",
      nombreFantasia: "Empresa Prueba",
      tipoOperacion: 1, // B2B
      direccion: "Avda. Mcal. López 1234",
      numeroCasa: "1234",
      departamento: 11, // Central
      distrito: 1, // Asunción
      ciudad: 1, // Asunción
      pais: "PRY",
      paisDescripcion: "Paraguay",
      tipoContribuyente: 2, // Persona jurídica
      documentoTipo: 1, // RUC
      documentoNumero: "80012345-6",
      telefono: "021123456",
      celular: "0981123456",
      email: "contacto@empresaprueba.com.py",
      codigo: "CLI001",
    },
    usuario: {
      documentoTipo: 1, // Cédula paraguaya
      documentoNumero: "1234567",
      nombre: "Juan Pérez",
      cargo: "Vendedor",
    },
    factura: {
      presencia: 1, // Operación presencial (como en el ejemplo)
    },
    condicion: {
      tipo: 1, // Contado
      entregas: [
        {
          tipo: 1, // Efectivo
          monto: "150000", // Como string según el ejemplo
          moneda: "PYG",
          cambio: 0.0,
        },
      ],
      credito: {
        tipo: 1, // Plazo
        plazo: "30 días",
        cuotas: 1,
        infoCuotas: [
          {
            moneda: "PYG",
            monto: 150000.00,
            vencimiento: new Date(new Date().setDate(new Date().getDate() + 30))
              .toISOString()
              .split("T")[0], // 30 días después
          },
        ],
      },
    },
    items: [
      {
        codigo: 1, // Formato según el ejemplo
        descripcion: "Producto de prueba 1",
        observacion: "Producto para testing",
        unidadMedida: 77, // Unidad
        cantidad: 2,
        precioUnitario: 50000,
        cambio: 0.0,
        ivaTipo: 1, // Gravado IVA
        ivaBase: 100, // Base imponible como porcentaje (según ejemplo)
        iva: 10, // 10%
        lote: "LOTE-001",
        vencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0], // 1 año después
      },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Laboratorio FacturaSend</h1>

      <div className="flex gap-4 mb-6">
        <button
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md disabled:bg-gray-400"
          onClick={() => enviarFactura(datoDePrueba)}
          disabled={isLoading}
        >
          {isLoading
            ? "Enviando..."
            : "Enviar Factura mediante hook"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-3xl">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {parametrosResponse && (
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2">
              Parámetros de FacturaSend:
            </h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
              {JSON.stringify(parametrosResponse, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-4 md:col-span-2">
          <h2 className="text-lg font-bold mb-2">Datos de Prueba:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
            {JSON.stringify(datoDePrueba, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FacturaSend;
