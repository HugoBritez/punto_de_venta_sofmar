// hooks/useFacturaSendTesting.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { api_url } from "@/utils";
import {
  DatosFacturaElectronica,
  FacturaSendResponse,
} from "@/types/factura_electronica/types";

export const useFacturaSendTesting = () => {
  const [parametros, setParametros] = useState<DatosFacturaElectronica | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState<any>(null);
  const [requestLog, setRequestLog] = useState<any[]>([]);
  const [responseLog, setResponseLog] = useState<any[]>([]);

  // Cargar parámetros automáticamente al inicializar el hook
  useEffect(() => {
    obtenerParametros();
  }, []);

  // Función para registrar solicitudes y respuestas
  const logRequest = (url: string, method: string, data: any, headers: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      url,
      method,
      data,
      headers,
    };
    setRequestLog((prev) => [...prev, logEntry]);
    return logEntry;
  };

  const logResponse = (requestLogEntry: any, response: any, error?: any) => {
    const logEntry = {
      requestTimestamp: requestLogEntry.timestamp,
      responseTimestamp: new Date().toISOString(),
      request: requestLogEntry,
      response: error ? null : response,
      error: error || null,
      success: !error,
    };
    setResponseLog((prev) => [...prev, logEntry]);
    return logEntry;
  };

  const obtenerParametros = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const requestLogEntry = logRequest(
        `${api_url}facturacion-electronica`,
        "GET",
        null,
        {}
      );

      const response = await axios.get(`${api_url}facturacion-electronica`);
      // Procesamos la respuesta según la estructura que vimos
      const datos = Array.isArray(response.data)
        ? response.data[0]
        : response.data.body
        ? response.data.body[0]
        : response.data;

      logResponse(requestLogEntry, datos);
      setParametros(datos);
      return datos;
    } catch (error: any) {
      const mensajeError = "Error al obtener parámetros de FacturaSend";
      console.error(mensajeError, error);
      setError(mensajeError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar una factura individual (método para testing)
  const enviarFactura = async (datosFactura: FacturaSendResponse) => {
    if (
      !parametros ||
      !parametros.parametros ||
      parametros.parametros.length === 0
    ) {
      const mensajeError = "No se han cargado los parámetros de FacturaSend";
      setError(mensajeError);
      throw new Error(mensajeError);
    }

    setIsLoading(true);
    setError(null);
    try {
      // Obtener la URL base y modificarla para usar /de/create
      const apiUrlBase = parametros.parametros[0].api_url_crear;
      const apiUrl = apiUrlBase.replace("/lote/create", "/de/create");
      const apiKey = parametros.parametros[0].api_key;

      // Formato confirmado del token de autorización
      const authHeader = `Bearer api_key_${apiKey}`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: authHeader,
      };

      const requestLogEntry = logRequest(apiUrl, "POST", datosFactura, headers);

      console.log("Enviando factura individual a:", apiUrl);
      console.log("Encabezado de autorización:", authHeader);
      console.log("Datos a enviar:", datosFactura);

      const response = await axios.post(apiUrl, datosFactura, { headers });

      const responseData = response.data;
      logResponse(requestLogEntry, responseData);
      setRespuesta(responseData);
      console.log("Respuesta recibida:", responseData);
      return responseData;
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al enviar factura individual";
      console.error(mensajeError, error);
      setError(mensajeError);

      // Registrar el error en los logs
      if (error.response) {
        const requestLogEntry = {
          timestamp: new Date().toISOString(),
          url: error.config.url,
          method: error.config.method,
          data: error.config.data,
          headers: error.config.headers,
        };
        logResponse(requestLogEntry, null, error.response.data);
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Probar diferentes formatos de token
  const probarFormatosToken = async (datosFactura: FacturaSendResponse) => {
    if (
      !parametros ||
      !parametros.parametros ||
      parametros.parametros.length === 0
    ) {
      const mensajeError = "No se han cargado los parámetros de FacturaSend";
      setError(mensajeError);
      throw new Error(mensajeError);
    }

    const apiUrlBase = parametros.parametros[0].api_url_crear;
    const apiUrl = apiUrlBase.replace("/lote/create", "/de/create");
    const apiKey = parametros.parametros[0].api_key;

    const formatosToken = [
      { nombre: "Sin prefijo", token: apiKey },
      { nombre: "Bearer con espacio", token: `Bearer ${apiKey}` },
      { nombre: "Bearer sin espacio", token: `Bearer${apiKey}` },
      {
        nombre: "api_key_ con prefijo Bearer",
        token: `Bearer api_key_${apiKey}`,
      },
      { nombre: "Solo api_key_", token: `api_key_${apiKey}` },
    ];

    const resultados = [];

    for (const formato of formatosToken) {
      try {
        setIsLoading(true);

        const headers = {
          "Content-Type": "application/json",
          Authorization: formato.token,
        };

        const requestLogEntry = logRequest(
          apiUrl,
          "POST",
          datosFactura,
          headers
        );

        console.log(`Probando formato "${formato.nombre}":`, formato.token);

        const response = await axios.post(apiUrl, datosFactura, { headers });

        const responseData = response.data;
        logResponse(requestLogEntry, responseData);

        resultados.push({
          formato: formato.nombre,
          token: formato.token,
          exito: true,
          respuesta: responseData,
        });

        console.log(`Formato "${formato.nombre}" exitoso:`, responseData);
      } catch (error: any) {
        const mensajeError =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error desconocido";

        resultados.push({
          formato: formato.nombre,
          token: formato.token,
          exito: false,
          error: mensajeError,
        });

        console.error(`Formato "${formato.nombre}" fallido:`, mensajeError);
      } finally {
        setIsLoading(false);
      }
    }

    return resultados;
  };

  // Generar datos de prueba con diferentes variaciones
  const generarDatosPrueba = () => {
    const fechaActual = new Date();
    const fechaActualStr = fechaActual.toISOString().split(".")[0]; // YYYY-MM-DDTHH:MM:SS

    // Factura básica
    const facturaBasica = {
      tipoDocumento: 1,
      establecimiento: 1,
      punto: "001",
      numero: 1,
      descripcion: "Factura de prueba básica",
      fecha: fechaActualStr,
      tipoEmision: 1,
      tipoTransaccion: 1,
      tipoImpuesto: 1,
      moneda: "PYG",
      cliente: {
        contribuyente: true,
        ruc: "80012345-6",
        razonSocial: "Empresa de Prueba S.A.",
        pais: "PRY",
        codigo: "CLI001",
      },
      usuario: {
        documentoTipo: 1,
        documentoNumero: "1234567",
        nombre: "Usuario de Prueba",
        cargo: "Tester",
      },
      factura: {
        presencia: 1,
      },
      condicion: {
        tipo: 1,
        entregas: [
          {
            tipo: 1,
            monto: "100000",
            moneda: "PYG",
            cambio: 0.0,
          },
        ],
        credito: {
          tipo: 1,
          plazo: "0 días",
          cuotas: 1,
          infoCuotas: [],
        },
      },
      items: [
        {
          codigo: "PROD001",
          descripcion: "Producto de prueba 1",
          unidadMedida: 77,
          cantidad: 1,
          precioUnitario: 100000,
          ivaTipo: 1,
          ivaBase: 100,
          iva: 10,
        },
      ],
    };

    // Factura con múltiples items
    const facturaMultiplesItems = {
      ...JSON.parse(JSON.stringify(facturaBasica)),
      descripcion: "Factura con múltiples items",
      numero: 2,
      items: [
        {
          codigo: "PROD001",
          descripcion: "Producto de prueba 1",
          unidadMedida: 77,
          cantidad: 2,
          precioUnitario: 50000,
          ivaTipo: 1,
          ivaBase: 100,
          iva: 10,
        },
        {
          codigo: "PROD002",
          descripcion: "Producto de prueba 2",
          unidadMedida: 77,
          cantidad: 1,
          precioUnitario: 75000,
          ivaTipo: 1,
          ivaBase: 100,
          iva: 10,
        },
        {
          codigo: "SERV001",
          descripcion: "Servicio de prueba",
          unidadMedida: 77,
          cantidad: 1,
          precioUnitario: 25000,
          ivaTipo: 1,
          ivaBase: 100,
          iva: 10,
        },
      ],
    };

    // Factura a crédito
    const facturaCredito = {
      ...JSON.parse(JSON.stringify(facturaBasica)),
      descripcion: "Factura a crédito",
      numero: 3,
      condicion: {
        tipo: 2, // Crédito
        entregas: [
          {
            tipo: 1,
            monto: "50000",
            moneda: "PYG",
            cambio: 0.0,
          },
        ],
        credito: {
          tipo: 2, // Cuotas
          cuotas: 3,
          infoCuotas: [
            {
              moneda: "PYG",
              monto: 50000,
              vencimiento: new Date(
                new Date().setDate(fechaActual.getDate() + 30)
              )
                .toISOString()
                .split("T")[0],
            },
            {
              moneda: "PYG",
              monto: 50000,
              vencimiento: new Date(
                new Date().setDate(fechaActual.getDate() + 60)
              )
                .toISOString()
                .split("T")[0],
            },
            {
              moneda: "PYG",
              monto: 50000,
              vencimiento: new Date(
                new Date().setDate(fechaActual.getDate() + 90)
              )
                .toISOString()
                .split("T")[0],
            },
          ],
        },
      },
    };

    // Factura con diferentes tipos de IVA
    const facturaIVAMixto = {
      ...JSON.parse(JSON.stringify(facturaBasica)),
      descripcion: "Factura con diferentes tipos de IVA",
      numero: 4,
      items: [
        {
          codigo: "PROD001",
          descripcion: "Producto con IVA 10%",
          unidadMedida: 77,
          cantidad: 1,
          precioUnitario: 50000,
          ivaTipo: 1, // Gravado IVA
          ivaBase: 100,
          iva: 10,
        },
        {
          codigo: "PROD002",
          descripcion: "Producto con IVA 5%",
          unidadMedida: 77,
          cantidad: 1,
          precioUnitario: 30000,
          ivaTipo: 1, // Gravado IVA
          ivaBase: 100,
          iva: 5,
        },
        {
          codigo: "PROD003",
          descripcion: "Producto exento",
          unidadMedida: 77,
          cantidad: 1,
          precioUnitario: 20000,
          ivaTipo: 3, // Exento
          ivaBase: 100,
          iva: 0,
        },
      ],
    };

    // Factura con diferentes formas de pago
    const facturaFormasPago = {
      ...JSON.parse(JSON.stringify(facturaBasica)),
      descripcion: "Factura con diferentes formas de pago",
      numero: 5,
      condicion: {
        tipo: 1, // Contado
        entregas: [
          {
            tipo: 1, // Efectivo
            monto: "50000",
            moneda: "PYG",
            monedaDescripcion: "Guarani",
            cambio: 0.0,
          },
          {
            tipo: 3, // Tarjeta de crédito
            monto: "50000",
            moneda: "PYG",
            monedaDescripcion: "Guarani",
            cambio: 0.0,
            infoTarjeta: {
              numero: 1234,
              tipo: 1, // Visa
              tipoDescripcion: "Visa",
              titular: "Juan Pérez",
              ruc: "80012345-6",
              razonSocial: "Bancard",
              medioPago: 1, // POS
              codigoAutorizacion: 123456,
            },
          },
        ],
        credito: {
          tipo: 1,
          plazo: "0 días",
          cuotas: 1,
          infoCuotas: [],
        },
      },
    };

    return {
      facturaBasica,
      facturaMultiplesItems,
      facturaCredito,
      facturaIVAMixto,
      facturaFormasPago,
      todasLasFacturas: [
        facturaBasica,
        facturaMultiplesItems,
        facturaCredito,
        facturaIVAMixto,
        facturaFormasPago,
      ],
    };
  };

  // Función para crear una factura base personalizable
  const crearFacturaBase = (
    datosPersonalizados: Partial<FacturaSendResponse> = {}
  ): FacturaSendResponse => {
    const fechaActual = new Date();
    const fechaActualStr = fechaActual.toISOString().split(".")[0]; // YYYY-MM-DDTHH:MM:SS

    const facturaBase: FacturaSendResponse = {
      tipoDocumento: 1,
      establecimiento: 1,
      punto: "001",
      numero: 1,
      descripcion: "Factura de prueba",
      fecha: fechaActualStr,
      tipoEmision: 1,
      tipoTransaccion: 1,
      tipoImpuesto: 1,
      moneda: "PYG",
      cliente: {
        contribuyente: true,
        ruc: "80012345-6",
        razonSocial: "Empresa de Prueba S.A.",
        nombreFantasia: "Empresa Prueba",
        tipoOperacion: 1,
        direccion: "Avda. Mcal. López 1234",
        numeroCasa: "1234",
        departamento: 11,
        distrito: 1,
        ciudad: 1,
        pais: "PRY",
        paisDescripcion: "Paraguay",
        tipoContribuyente: 2,
        documentoTipo: 1,
        documentoNumero: "80012345-6",
        telefono: "021123456",
        celular: "0981123456",
        email: "contacto@empresaprueba.com.py",
        codigo: "CLI001",
      },
      usuario: {
        documentoTipo: 1,
        documentoNumero: "1234567",
        nombre: "Juan Pérez",
        cargo: "Vendedor",
      },
      factura: {
        presencia: 1,
      },
      condicion: {
        tipo: 1,
        entregas: [
          {
            tipo: 1,
            monto: "150000",
            moneda: "PYG",
            cambio: 0.0,
          },
        ],
        credito: {
          tipo: 1,
          plazo: "30 días",
          cuotas: 1,
          infoCuotas: [
            {
              moneda: "PYG",
              monto: 150000,
              vencimiento: new Date(
                new Date().setDate(fechaActual.getDate() + 30)
              )
                .toISOString()
                .split("T")[0],
            },
          ],
        },
      },
      items: [
        {
          codigo: 1,
          descripcion: "Producto de prueba 1",
          observacion: "Producto para testing",
          unidadMedida: 77,
          cantidad: 2,
          precioUnitario: 50000,
          cambio: 0.0,
          ivaTipo: 1,
          ivaBase: 100,
          iva: 10,
          lote: "LOTE-001",
          vencimiento: new Date(
            new Date().setFullYear(fechaActual.getFullYear() + 1)
          )
            .toISOString()
            .split("T")[0],
        },
      ],
    };

    // Combinar la factura base con los datos personalizados
    return { ...facturaBase, ...datosPersonalizados };
  };

  // Crear un item base para agregar a la factura
  const crearItemBase = (datosPersonalizados: Partial<any> = {}) => {
    const itemBase = {
      codigo: "PROD001",
      descripcion: "Producto",
      unidadMedida: 77, // Unidad
      cantidad: 1,
      precioUnitario: 0,
      cambio: 0.0,
      ivaTipo: 1, // Gravado IVA
      ivaBase: 100, // Base imponible como porcentaje (según ejemplo)
      iva: 10, // 10%
    };

    // Combinar el item base con los datos personalizados
    return { ...itemBase, ...datosPersonalizados };
  };

  // Función para calcular el total de una factura
  const calcularTotalFactura = (factura: FacturaSendResponse): number => {
    if (!factura.items || factura.items.length === 0) return 0;

    return factura.items.reduce((total, item) => {
      const subtotal = item.cantidad * item.precioUnitario;
      return total + subtotal;
    }, 0);
  };

  // Probar diferentes tipos de documentos
  const probarTiposDocumentos = async () => {
    if (
      !parametros ||
      !parametros.parametros ||
      parametros.parametros.length === 0
    ) {
      const mensajeError = "No se han cargado los parámetros de FacturaSend";
      setError(mensajeError);
      throw new Error(mensajeError);
    }

    const apiUrlBase = parametros.parametros[0].api_url_crear;
    const apiUrl = apiUrlBase.replace("/lote/create", "/de/create");
    const apiKey = parametros.parametros[0].api_key;

    // Formato confirmado del token de autorización
    const authHeader = `Bearer api_key_${apiKey}`;

    const fechaActual = new Date();
    const fechaActualStr = fechaActual.toISOString().split(".")[0];

    const tiposDocumentos = [
      {
        tipo: 1,
        nombre: "Factura Electrónica",
        datos: {
          tipoDocumento: 1,
          establecimiento: 1,
          punto: "001",
          numero: 1,
          descripcion: "Factura Electrónica de prueba",
          fecha: fechaActualStr,
          tipoEmision: 1,
          tipoTransaccion: 1,
          tipoImpuesto: 1,
          moneda: "PYG",
          cliente: {
            contribuyente: true,
            ruc: "80012345-6",
            razonSocial: "Empresa de Prueba S.A.",
            pais: "PRY",
            codigo: "CLI001",
          },
          usuario: {
            documentoTipo: 1,
            documentoNumero: "1234567",
            nombre: "Usuario de Prueba",
            cargo: "Tester",
          },
          factura: {
            presencia: 1,
          },
          condicion: {
            tipo: 1,
            entregas: [
              {
                tipo: 1,
                monto: "100000",
                moneda: "PYG",
                cambio: 0.0,
              },
            ],
            credito: {
              tipo: 1,
              plazo: "0 días",
              cuotas: 1,
              infoCuotas: [],
            },
          },
          items: [
            {
              codigo: "PROD001",
              descripcion: "Producto de prueba 1",
              unidadMedida: 77,
              cantidad: 1,
              precioUnitario: 100000,
              ivaTipo: 1,
              ivaBase: 100,
              iva: 10,
            },
          ],
        },
      },
      {
        tipo: 5,
        nombre: "Nota de Crédito Electrónica",
        datos: {
          tipoDocumento: 5,
          establecimiento: 1,
          punto: "001",
          numero: 1,
          descripcion: "Nota de Crédito de prueba",
          fecha: fechaActualStr,
          tipoEmision: 1,
          tipoTransaccion: 1,
          tipoImpuesto: 1,
          moneda: "PYG",
          cliente: {
            contribuyente: true,
            ruc: "80012345-6",
            razonSocial: "Empresa de Prueba S.A.",
            pais: "PRY",
            codigo: "CLI001",
          },
          usuario: {
            documentoTipo: 1,
            documentoNumero: "1234567",
            nombre: "Usuario de Prueba",
            cargo: "Tester",
          },
          notaCreditoDebito: {
            motivo: 1, // Devolución y Ajuste de precios
          },
          condicion: {
            tipo: 1,
            entregas: [
              {
                tipo: 1,
                monto: "100000",
                moneda: "PYG",
                cambio: 0.0,
              },
            ],
            credito: {
              tipo: 1,
              plazo: "0 días",
              cuotas: 1,
              infoCuotas: [],
            },
          },
          items: [
            {
              codigo: "PROD001",
              descripcion: "Producto de prueba 1",
              unidadMedida: 77,
              cantidad: 1,
              precioUnitario: 100000,
              ivaTipo: 1,
              ivaBase: 100,
              iva: 10,
            },
          ],
          documentoAsociado: {
            tipoDocumentoAsociado: 1, // Factura Electrónica
            cdc: "01800695631001001000000012021112410311184194", // CDC de una factura existente
            timbrado: null,
            establecimiento: "001",
            punto: "001",
            numero: "0000001",
            fecha: fechaActualStr,
            tipoDocumentoImpreso: 1,
          },
        },
      },
    ];

    const resultados = [];

    for (const tipoDoc of tiposDocumentos) {
      try {
        setIsLoading(true);

        const headers = {
          "Content-Type": "application/json",
          Authorization: authHeader,
        };

        const requestLogEntry = logRequest(
          apiUrl,
          "POST",
          tipoDoc.datos,
          headers
        );

        console.log(
          `Probando tipo de documento "${tipoDoc.nombre}" (${tipoDoc.tipo})`
        );

        const response = await axios.post(apiUrl, tipoDoc.datos, { headers });

        const responseData = response.data;
        logResponse(requestLogEntry, responseData);

        resultados.push({
          tipo: tipoDoc.tipo,
          nombre: tipoDoc.nombre,
          exito: true,
          respuesta: responseData,
        });

        console.log(
          `Tipo de documento "${tipoDoc.nombre}" exitoso:`,
          responseData
        );
      } catch (error: any) {
        const mensajeError =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error desconocido";

        resultados.push({
          tipo: tipoDoc.tipo,
          nombre: tipoDoc.nombre,
          exito: false,
          error: mensajeError,
        });

        console.error(
          `Tipo de documento "${tipoDoc.nombre}" fallido:`,
          mensajeError
        );
      } finally {
        setIsLoading(false);
      }
    }

    return resultados;
  };

  // Limpiar logs
  const limpiarLogs = () => {
    setRequestLog([]);
    setResponseLog([]);
    setRespuesta(null);
    setError(null);
  };


  // Verificar el estado de una factura por CDC
  const verificarEstadoFactura = async (cdc: string) => {
    if (
      !parametros ||
      !parametros.parametros ||
      parametros.parametros.length === 0
    ) {
      const mensajeError = "No se han cargado los parámetros de FacturaSend";
      setError(mensajeError);
      throw new Error(mensajeError);
    }

    setIsLoading(true);
    setError(null);
    try {
      // Construir URL para consultar estado
      const apiUrlBase = parametros.parametros[0].api_url_crear;
      const posicionSofmar = apiUrlBase.indexOf("/sofmar") + "/sofmar".length;
      const baseUrl = apiUrlBase.substring(0, posicionSofmar);
      const apiUrl = `${baseUrl}/de/cdc/${cdc}`;
      const apiKey = parametros.parametros[0].api_key;

      // Formato confirmado del token de autorización
      const authHeader = `Bearer api_key_${apiKey}`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: authHeader,
      };

      const requestLogEntry = logRequest(apiUrl, "GET", null, headers);

      console.log("Consultando estado de factura con CDC:", cdc);

      const response = await axios.get(apiUrl, { headers });

      const responseData = response.data;
      logResponse(requestLogEntry, responseData);
      setRespuesta(responseData);
      return responseData;
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al consultar estado de factura";
      console.error(mensajeError, error);
      setError(mensajeError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    parametros,
    isLoading,
    error,
    respuesta,
    requestLog,
    responseLog,
    obtenerParametros,
    enviarFactura,
    probarFormatosToken,
    probarTiposDocumentos,
    generarDatosPrueba,
    crearFacturaBase,
    crearItemBase,
    calcularTotalFactura,
    verificarEstadoFactura,
    limpiarLogs,
  };
};
