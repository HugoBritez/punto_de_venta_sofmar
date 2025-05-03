import { Configuraciones } from "@/types/shared_interfaces";
import axios from "axios";
import { api_url } from "@/utils";
import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { generatePDF } from "@/services/pdfService";

interface ModeloTicketProps {
  id_venta?: number;
  monto_entregado?: number;
  monto_recibido?: number;
  vuelto?: number;
  onImprimir?: boolean;
  accion?: "print" | "download" | "b64";
}

interface VentaTicket {
  codigo: number;
  tipo_venta: string;
  fecha_venta: string;
  fecha_vencimiento: string;
  cajero: string;
  vendedor: string;
  cliente: string;
  cliente_correo: string;
  direccion: string;
  telefono: string;
  ruc: string;
  subtotal: number;
  total_descuento: number;
  total_a_pagar: number;
  total_exentas: number;
  total_diez: number;
  total_cinco: number;
  timbrado: string;
  factura: string;
  factura_valido_desde: string;
  factura_valido_hasta: string;
  ve_qr?: string;
  ve_cdc: string;
  usa_fe: number;
  moneda: string;
  cotizacion: number;
  detalles: {
    codigo: number;
    descripcion: string;
    cantidad: number;
    precio: number;
    total: number;
    exentas: number;
    diez: number;
    cinco: number;
    fecha_vencimiento: string;
    lote: string;
    control_vencimiento: number;
  }[];
  sucursal_data: {
    sucursal_nombre: string;
    sucursal_direccion: string;
    sucursal_telefono: string;
    sucursal_empresa: string;
    sucursal_ruc: string;
    sucursal_matriz: string;
    sucursal_correo: string;
  }[];
  configuracion_factura_electronica: {
    nombre: string;
    fantasia: string;
    direccion: string;
    telefono: string;
    ruc: string;
    correo: string;
    descripcion_establecimiento: string;
    dato_establecimiento: string;
  }[];
}

const ModeloFacturaReport = ({
  id_venta,
  onImprimir = false,
  accion = "print",
}: ModeloTicketProps) => {
  const [venta, setVenta] = useState<VentaTicket | null>(null);
  const [configuraciones, setConfiguraciones] = useState<
    Configuraciones[] | null
  >(null);
  const [prevOnImprimir, setPrevOnImprimir] = useState(false);
  const toast = useToast();

  const formatNumber = (number: number) => {
    // Verificar que el valor sea un número válido
    const validNumber =
      typeof number === "number" && !isNaN(number) ? number : 0;

    // Si la moneda es dólares, mantener 2 decimales
    if (venta?.moneda === "DOLAR") {
      return validNumber
        .toFixed(2) // Mantener 2 decimales
        .replace(".", ",") // Cambiar punto por coma para decimales
        .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Separador de miles
    } else {
      // Para otras monedas, seguir con el formato sin decimales
      return validNumber
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        .replace(".", ",");
    }
  };

  const monedaSimbolo = () => {
    if (venta?.moneda === "GUARANI") {
      return "Gs.";
    } else if (venta?.moneda === "DOLAR") {
      return "USD";
    } else if (venta?.moneda === "REAL") {
      return "BRL";
    } else if (venta?.moneda === "PESO") {
      return "ARS";
    }
  };

  const monedaPalabra = ( monto: string): string => {
    // Para montos en dólares, formatea con "XX/100"
    if (venta?.moneda === "DOLAR") {
      // Extraer los decimales
      const partes = venta?.total_a_pagar.toString().split('.');
      let centavos = "00";
      if (partes && partes.length > 1) {
        centavos = partes[1].padEnd(2, '0').substring(0, 2);
      }
      return `DOLARES AMERICANOS ${monto} CON ${centavos}/100`;
    }
    
    // Para otras monedas
    switch (venta?.moneda) {
      case "GUARANI":
        return `GUARANÍES ${monto}`;
      case "REAL":
        return `REALES ${monto}`;
      case "PESO":
        return `PESOS ARGENTINOS ${monto}`;
      default:
        return `GUARANÍES ${monto}`;
    }
  };

  // Función para convertir números a palabras
  const numeroALetras = (numero: number): string => {
    // Arrays con nombres de números
    const unidades = [
      "",
      "Un",
      "Dos",
      "Tres",
      "Cuatro",
      "Cinco",
      "Seis",
      "Siete",
      "Ocho",
      "Nueve",
    ];
    const especiales = [
      "Diez",
      "Once",
      "Doce",
      "Trece",
      "Catorce",
      "Quince",
      "Dieciséis",
      "Diecisiete",
      "Dieciocho",
      "Diecinueve",
    ];
    const decenas = [
      "",
      "Diez",
      "Veinte",
      "Treinta",
      "Cuarenta",
      "Cincuenta",
      "Sesenta",
      "Setenta",
      "Ochenta",
      "Noventa",
    ];
    const centenas = [
      "",
      "Ciento",
      "Doscientos",
      "Trescientos",
      "Cuatrocientos",
      "Quinientos",
      "Seiscientos",
      "Setecientos",
      "Ochocientos",
      "Novecientos",
    ];

    // Para el caso especial del cero
    if (numero === 0) {
      return "Cero";
    }

    // Para números negativos
    if (numero < 0) {
      return "Menos " + numeroALetras(Math.abs(numero));
    }

    // Convertir centenas
    const convertirCentenas = (n: number): string => {
      let resultado = "";

      // Obtener dígitos
      const centena = Math.floor(n / 100);
      const decena = Math.floor((n % 100) / 10);
      const unidad = n % 10;

      // Formar texto de centenas
      if (centena > 0) {
        if (centena === 1 && decena === 0 && unidad === 0) {
          resultado = "Cien";
        } else {
          resultado = centenas[centena];
        }
      }

      // Formar texto de decenas y unidades
      if (decena > 0) {
        if (decena === 1) {
          // Números del 10 al 19
          if (resultado !== "") {
            resultado += " ";
          }
          resultado += especiales[unidad];
          return resultado;
        } else if (decena === 2 && unidad > 0) {
          // Números del 21 al 29
          if (resultado !== "") {
            resultado += " ";
          }
          const unidadTexto = unidades[unidad];
          resultado += "Veinti" + (unidadTexto ? unidadTexto.toLowerCase() : "");
          return resultado;
        } else {
          // Resto de decenas
          if (resultado !== "") {
            resultado += " ";
          }
          resultado += decenas[decena];
          if (unidad > 0) {
            const unidadTexto = unidades[unidad];
            if (unidadTexto) {
              resultado += " y " + unidadTexto.toLowerCase();
            }
          }
          return resultado;
        }
      }

      // Solo unidades
      if (unidad > 0) {
        if (resultado !== "") {
          resultado += " ";
        }
        resultado += unidades[unidad];
      }

      return resultado;
    };

    // Función para manejar miles y millones
    const procesarGrupo = (
      n: number,
      singular: string,
      plural: string
    ): string => {
      if (n === 0) {
        return "";
      } else if (n === 1) {
        return " " + singular;
      } else {
        return " " + convertirCentenas(n) + " " + plural;
      }
    };

    let resultado = "";

    // Millones
    const millones = Math.floor(numero / 1000000);
    if (millones > 0) {
      resultado =
        millones === 1
          ? "Un Millón"
          : convertirCentenas(millones) + " Millones";
    }

    // Miles
    const miles = Math.floor((numero % 1000000) / 1000);
    if (miles > 0) {
      const textoMiles = procesarGrupo(miles, "Mil", "Mil");
      resultado += (resultado !== "" ? " " : "") + textoMiles;
    }

    // Unidades
    const unidadesVal = numero % 1000;
    if (unidadesVal > 0 || resultado === "") {
      resultado +=
        (resultado !== "" ? " " : "") + convertirCentenas(unidadesVal);
    }

    return `${monedaPalabra(resultado)}`;
  };

  const [headerImage, setHeaderImage] = useState<string | null>(null);

  const getEncabezadoFactura = async (): Promise<string | null> => {
    try {
      console.log("Obteniendo imagen de encabezado...");

      // Primero intentar la API normal
      const response = await axios.get(`${api_url}upload-factura-images`);

      if (response.data.body) {
        console.log("Imagen obtenida del API, procesando...");
        try {
          // Convertir a base64 inmediatamente
          const imgBase64 = await convertirImagenBase64(response.data.body);
          console.log("Imagen convertida a base64 correctamente desde API");
          setHeaderImage(imgBase64);
          return imgBase64;
        } catch (error) {
          console.error("Error al convertir imagen a base64 desde API:", error);
        }
      }

      // Si no funciona, probar búsqueda con múltiples formatos
      console.log("Intentando método alternativo...");
      const baseUrl = api_url.replace(/api\/?$/, "");

      // Probar diferentes extensiones
      const extensiones = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

      for (const ext of extensiones) {
        const url = `${baseUrl}upload/factura_images/header${ext}`;
        console.log(`Intentando cargar imagen desde: ${url}`);

        try {
          const response = await fetch(url, { method: "HEAD" });

          if (response.ok) {
            console.log(`Imagen encontrada: ${url}`);
            try {
              const imgBase64 = await convertirImagenBase64(url);
              console.log("Imagen convertida a base64 correctamente");
              // Verificar resultado antes de actualizar estado
              if (imgBase64 && imgBase64.startsWith("data:image")) {
                console.log("Imagen válida encontrada, actualizando estado");
                setHeaderImage(imgBase64);
                return imgBase64;
              } else {
                console.error(
                  "La imagen convertida no es válida:",
                  imgBase64?.substring(0, 50)
                );
              }
            } catch (imgError) {
              console.error(`Error convertiendo imagen ${ext}:`, imgError);
            }
          }
        } catch (error) {
          console.error(`Error al verificar formato ${ext}:`, error);
        }
      }

      console.warn("No se pudo encontrar ninguna imagen de encabezado");
      return null;
    } catch (error) {
      console.error("Error al obtener encabezado:", error);
      return null;
    }
  };

  const convertirImagenBase64 = (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Importante para URLs externas

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL("image/jpeg");
          console.log("Imagen convertida a base64 correctamente");
          resolve(dataUrl);
        } catch (error) {
          console.error("Error al procesar imagen en canvas:", error);
          reject(error);
        }
      };

      img.onerror = (e) => {
        console.error("Error al cargar la imagen:", e);
        reject(new Error("No se pudo cargar la imagen"));
      };

      // Establecer un timeout para evitar esperar indefinidamente
      setTimeout(() => {
        reject(new Error("Timeout al cargar la imagen"));
      }, 5000);

      img.src = imgUrl;
    });
  };

  const generarPDF = async (tipoSalida: "print" | "download" | "b64" = "print") => {
    try {
      console.log(
        "Estado de la imagen antes de generar PDF:",
        !!headerImage,
        headerImage ? `(longitud: ${headerImage.length})` : ""
      );

      // Si no tenemos la imagen, intentar obtenerla nuevamente
      let imagenFinal = headerImage;
      if (!headerImage) {
        console.log("Imagen no disponible, intentando obtenerla nuevamente");
        imagenFinal = await getEncabezadoFactura();
        console.log("¿Se obtuvo la imagen?", !!imagenFinal);
      }

      const descripcionArticulo = (
        descripcion: string,
        lote: string,
        fecha_vencimiento: string,
        control_vencimiento: number
      ) => {
        if (control_vencimiento === 1) {
          return `${descripcion} ${lote ? `Lote: ${lote}` : ""} - ${
            fecha_vencimiento ? `Vencimiento: ${fecha_vencimiento}` : ""
          }`;
        } else {
          return descripcion;
        }
      };

      // Asegurarse de que los detalles existan y tengan el formato correcto
      const detallesVenta =
        venta?.detalles.map((detalle) => [
          { text: detalle.codigo.toString(), fontSize: 7 },
          {
            text: detalle.cantidad.toString(),
            fontSize: 7,
            alignment: "center",
          },
          {
            text: descripcionArticulo(
              detalle.descripcion,
              detalle.lote,
              detalle.fecha_vencimiento,
              detalle.control_vencimiento
            ),
            fontSize: 7,
          },
          {
            text: `${(Number(detalle.precio) || 0).toLocaleString("es-PY")}`,
            fontSize: 7,
            alignment: "right",
          },
          {
            text: `${(Number(detalle.exentas) || 0).toLocaleString("es-PY")}`,
            fontSize: 7,
            alignment: "right",
          },
          {
            text: `${(Number(detalle.cinco) || 0).toLocaleString("es-PY")}`,
            fontSize: 7,
            alignment: "right",
          },
          {
            text: `${(Number(detalle.diez) || 0).toLocaleString("es-PY")}`,
            fontSize: 7,
            alignment: "right",
          },
        ]) || [];

      // Asegurar altura mínima de 5.5 cm (aproximadamente 8-10 filas)
      const filasActuales = detallesVenta.length;
      
      // Calcular espacio en blanco basado en la relación reals
      // 37 items llenos ≈ 85 filas vacías
      const relacionFilas = 85 / 37; // ≈ 2.3
      const maxFilasVacias = 85; // Máximo de filas vacías que entran en la hoja
      const espacioEnBlanco = Math.max(20, Math.floor((37 - filasActuales) * relacionFilas));
      const minFilasRequeridas = Math.min(37 + maxFilasVacias, Math.max(15, filasActuales + espacioEnBlanco));

      
      // Si tenemos menos filas que el mínimo, añadir filas vacías
      if (filasActuales < minFilasRequeridas) {
        const filasVaciasNecesarias = minFilasRequeridas - filasActuales;
        for (let i = 0; i < filasVaciasNecesarias; i++) {
          detallesVenta.push([
            { text: "", fontSize: 7 },
            { text: "", fontSize: 7 },
            { text: "", fontSize: 7 },
            { text: "", fontSize: 7 },
            { text: "", fontSize: 7 },
            { text: "", fontSize: 7 },
            { text: "", fontSize: 7 },
          ]);
        }
      }

      // Crear el stack condicional para la imagen con verificación más estricta
      const logoStack = [];

      // Solo añadir la imagen si está disponible y es válida
      if (imagenFinal && imagenFinal.startsWith("data:image")) {
        console.log("Usando imagen en el PDF");
        logoStack.push({
          image: imagenFinal,
          width: 120,
          height: 50,
          alignment: "left",
        });
      } else {
        // Alternativa cuando no hay imagen
        console.log("No hay imagen disponible, usando texto alternativo");
        logoStack.push({
          text: "LOGO NO DISPONIBLE",
          fontSize: 12,
          bold: true,
          alignment: "left",
          margin: [0, 30, 0, 10],
        });
      }

      // Añadir el resto del contenido
      logoStack.push(
        {
          text: venta?.configuracion_factura_electronica[0].nombre,
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 5],
          alignment: "center",
        },
        {
          text: venta?.configuracion_factura_electronica[0].direccion || "",
          fontSize: 9,
          alignment: "center",
        },
        {
          text: `Teléfono: ${
            venta?.configuracion_factura_electronica[0].telefono || ""
          }`,
          fontSize: 9,
          alignment: "center",
        },
        {
          text:
            "Correo: " + venta?.configuracion_factura_electronica[0].correo ||
            "",
          fontSize: 9,
          alignment: "center",
        }
      );

      const datos_establecimiento = () => {
        if (venta?.usa_fe === 1) {
          return [{
            stack: [
              {
                text: "kuDE FACTURA ELECTRONICA",
                fontSize: 10,
                bold: true,
                alignment: "center",
                margin: [0, 5, 0, 0],
              },
              {
                text: venta?.configuracion_factura_electronica[0].descripcion_establecimiento,
                fontSize: 10,
                alignment: "right",
                margin: [0, 5, 0, 0],
              },
              {
                text: venta?.configuracion_factura_electronica[0].dato_establecimiento,
                fontSize: 10,
                alignment: "right",
                margin: [0, 5, 0, 0],
              },
            ],
          }];
        } else {
          return [];
        }
      };
      // Preparar el contenido del PDF
      const contenidoPDF = [
        {
          table: {
            widths: ["60%", "40%"],
            body: [
              [
                // Columna izquierda: Logo y datos de empresa
                {
                  columns: [
                    {
                      stack: logoStack,
                      margin: [0, 5, 0, 5],
                    },
                    ...datos_establecimiento(),
                  ],
                },
                // Columna derecha: Datos de factura
                {
                  stack: [
                    {
                      text:
                        "RUC:           " +
                        venta?.configuracion_factura_electronica[0].ruc,
                      fontSize: 9,
                      alignment: "center",
                      width: "*",
                    },
                    {
                      text:
                        "Inicio de Validez:        " +
                        venta?.factura_valido_desde,
                      fontSize: 9,
                      alignment: "center",
                      width: "30%",
                    },
                    {
                      text: "Timbrado:            " + venta?.timbrado,
                      fontSize: 9,
                      alignment: "center",
                      width: "30%",
                    },
                    {
                      text: "FACTURA ELECTRÓNICA",
                      fontSize: 10,
                      bold: true,
                      alignment: "center",
                      margin: [0, 5, 0, 0],
                    },
                    {
                      text: venta?.factura,
                      fontSize: 10,
                      alignment: "center",
                    },
                  ],
                  margin: [0, 5, 0, 0],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i: number, node: any) {
              return i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function () {
              return 0.5;
            },
            paddingTop: function () {
              return 8;
            },
            paddingBottom: function () {
              return 8;
            },
            paddingLeft: function () {
              return 8;
            },
            paddingRight: function () {
              return 8;
            },
          },
          margin: [0, 0, 0, 0],
        },
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  columns: [
                    {
                      stack: [
                        {
                          text: `Fecha de emision: ${venta?.fecha_venta}`,
                          fontSize: 8,
                        },
                        {
                          text: `Nombre/Razon Social: ${venta?.cliente}`,
                          fontSize: 8,
                        },
                        {
                          text: `DIRECCION: ${venta?.direccion}`,
                          fontSize: 8,
                        },
                      ],
                      width: "*",
                    },
                    {
                      stack: [
                        {
                          text: `RUC: ${venta?.ruc}`,
                          fontSize: 8,
                        },
                        {
                          text: `Teléfono: ${venta?.telefono}`,
                          fontSize: 8,
                        },
                        {
                          text: `Correo Electronico: ${venta?.cliente_correo}`,
                          fontSize: 8,
                        },
                      ],
                      width: "auto",
                    },
                    {
                      stack: [
                        {
                          text: `Condicion de venta: ${venta?.tipo_venta}`,
                          fontSize: 8,
                        },
                        {
                          text: `Moneda: ${venta?.moneda}`,
                          fontSize: 8,
                        },
                        {
                          text: `Sucursal: ${venta?.sucursal_data[0].sucursal_nombre}`,
                          fontSize: 8,
                        },
                        {
                          text: `Cotizacion: ${venta?.cotizacion}`,
                          fontSize: 8,
                        },
                      ],
                      width: "auto",
                      alignment: "right",
                    },
                  ],
                  margin: [0, 5, 0, 0],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i: number, node: any) {
              return i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function () {
              return 0.5;
            },
            paddingTop: function () {
              return 4;
            },
            paddingBottom: function () {
              return 4;
            },
            paddingLeft: function () {
              return 8;
            },
            paddingRight: function () {
              return 8;
            },
          },
          margin: [0, 0, 0, 0],
        },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "*", "auto", "auto", "auto", "auto"],
            body: [
              [
                {
                  text: "Código",
                  fontSize: 8,
                  bold: true,
                  alignment: "center",
                },
                { text: "Cant.", fontSize: 8, bold: true, alignment: "center" },
                {
                  text: "Descripción",
                  fontSize: 8,
                  bold: true,
                  alignment: "center",
                },
                {
                  text: "Precio Uni.",
                  fontSize: 8,
                  bold: true,
                  alignment: "center",
                },
                {
                  text: "Exentas",
                  fontSize: 8,
                  bold: true,
                  alignment: "center",
                },
                { text: "5%", fontSize: 8, bold: true, alignment: "center" },
                { text: "10%", fontSize: 8, bold: true, alignment: "center" },
              ],
              ...detallesVenta,
            ],
          },
          margin: [0, 0, 0, 0],
          layout: {
            hLineWidth: function (i: number) {
              return i === 0 || i === 1;
            },
            vLineWidth: function () {
              return 0.5;
            },
            paddingLeft: function () {
              return 5;
            },
            paddingRight: function () {
              return 5;
            },
            paddingTop: function () {
              return 3;
            },
            paddingBottom: function () {
              return 3;
            },
          },
        } as any,
      ];

      // Agregar contenido condicional para factura electrónica
      if (venta?.usa_fe === 1) {
        contenidoPDF.push(
          {
            table: {
              widths: ["*", "10%", "10%", "10%"],
              body: [
                [
                  { text: "Sub-Totales:", fontSize: 8, bold: true },
                  {
                    text: venta?.total_exentas
                      ? formatNumber(Number(venta.total_exentas))
                      : 0,
                    fontSize: 8,
                    alignment: "right",
                  },
                  {
                    text: venta?.total_cinco
                      ? formatNumber(Number(venta.total_cinco))
                      : 0,
                    fontSize: 8,
                    alignment: "right",
                  },
                  {
                    text: venta?.total_diez
                      ? formatNumber(Number(venta.total_diez))
                      : 0,
                    fontSize: 8,
                    alignment: "right",
                  },
                ],
                [
                  { text: "Totales Operaciones:", fontSize: 8, bold: true },
                  { text: "", fontSize: 8, alignment: "right" },
                  { text: "", fontSize: 8, alignment: "right" },
                  {
                    text: `${Number(venta?.total_a_pagar || 0).toLocaleString(
                      "es-PY"
                    )}`,
                    fontSize: 8,
                    bold: true,
                    alignment: "right",
                  },
                ] as any,
                [
                  {
                    text: `Total: ${numeroALetras(
                      Number(venta?.total_a_pagar || 0)
                    )}`,
                    fontSize: 8,
                    bold: true,
                    italics: true,
                  },
                  {
                    text: "",
                    fontSize: 8,
                    bold: true,
                    italics: true,
                  },
                  { text: "", fontSize: 8, alignment: "right" },
                  { text: "", fontSize: 8, alignment: "right" },
                ],
              ],
            },
            layout: {
              hLineWidth: function (i: number, node: any) {
                return i === 0 || i === node.table.body.length ? 0.5 : 0.3;
              } as any,
              vLineWidth: function (i: number, node: any) {
                return i === 0 || i === node.table.widths.length ? 0.5 : 0;
              },
              paddingLeft: function () {
                return 5;
              },
              paddingRight: function () {
                return 5;
              },
              paddingTop: function () {
                return 3;
              },
              paddingBottom: function () {
                return 3;
              },
            },
            margin: [0, 0, 0, 0],
          },
          {
            table: {
              widths: ["20%", "15%", "20%", "15%", "15%", "15%"],
              body: [
                [
                  {
                    text: "Liquidación de IVA (5%):",
                    fontSize: 8,
                  },
                  {
                    text: venta?.total_cinco
                      ? `${monedaSimbolo()} ${formatNumber(
                          Number(venta.total_cinco) / 22
                        )}`
                      : `${monedaSimbolo()} 0`,
                    fontSize: 8,
                    alignment: "right",
                  },
                  {
                    text: "Liquidación de IVA (10%):",
                    fontSize: 8,
                  },
                  {
                    text: venta?.total_diez
                      ? `${monedaSimbolo()} ${formatNumber(
                          Number(venta.total_diez) / 11
                        )}`
                      : `${monedaSimbolo()} 0`,
                    fontSize: 8,
                    alignment: "right",
                  },
                  {
                    text: "Total IVA:",
                    fontSize: 8,
                    bold: true,
                  },
                  {
                    text: `${monedaSimbolo()} ${formatNumber(
                      (venta?.total_cinco
                        ? Number(venta.total_cinco) / 22
                        : 0) +
                        (venta?.total_diez ? Number(venta.total_diez) / 11 : 0)
                    )}`,
                    fontSize: 8,
                    alignment: "right",
                    bold: true,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: function () {
                return 0;
              },
              vLineWidth: function (i: number, node: any) {
                return i === 0 || i === node.table.widths.length ? 0.5 : 0;
              },
              paddingLeft: function () {
                return 5;
              },
              paddingRight: function () {
                return 5;
              },
              paddingTop: function () {
                return 3;
              },
              paddingBottom: function () {
                return 3;
              },
            },
            margin: [0, 0, 0, 0],
          },
          {
            table: {
              widths: ["*"],
              body: [
                [
                  {
                    columns: [
                      {
                        stack: [
                          venta?.ve_qr && venta.ve_qr !== ""
                            ? {
                                qr: venta.ve_qr,
                                fit: 110,
                                alignment: "center",
                                eccLevel: "H",
                                version: 5,
                              }
                            : {
                                text: "FACTURA EN PROCESO DE VALIDACIÓN",
                                fontSize: 9,
                                bold: true,
                                alignment: "center",
                                margin: [0, 10, 0, 10],
                              },
                        ],
                        width: "20%",
                      },
                      {
                        // Columna derecha para el texto informativo
                        stack: [
                          {
                            text: "Consulte esta Factura Electrónica con el número impreso abajo:",
                            fontSize: 8,
                            alignment: "center",
                          },
                          {
                            text: `https://ekuatia.set.gov.py/consultas/${venta.ve_cdc}`,
                            fontSize: 8,
                            alignment: "center",
                            margin: [0, 3, 0, 3],
                          },
                          {
                            text: "ESTE DOCUMENTO ES UNA REPRESENTACIÓN GRÁFICA DE UN DOCUMENTO ELECTRÓNICO (XML)",
                            fontSize: 8,
                            alignment: "center",
                            bold: true,
                          },
                          {
                            text: "Si su documento electronico presenta algun error solicitar la cancelacion dentro de las 48 horas siguientes de la emisión de este comprobante.",
                            fontSize: 7,
                            alignment: "center",
                          },
                        ],
                        width: "80%",
                      },
                    ],
                    margin: [10, 0, 10, 0],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: function () {
                return 0.5;
              },
              vLineWidth: function () {
                return 0.5;
              },
              paddingTop: function () {
                return 5;
              },
              paddingBottom: function () {
                return 5;
              },
              paddingLeft: function () {
                return 5;
              },
              paddingRight: function () {
                return 5;
              },
            },
            margin: [0, 0, 0, 0],
          }
        );
      } else {
        // Para facturas no electrónicas mantener el formato original
        contenidoPDF.push(
          {
            text: "***GRACIAS POR SU PREFERENCIA***",
            style: "text",
            fontSize: 11,
            alignment: "center",
            margin: [0, 10, 0, 5],
          },
          {
            columns: [
              {
                text: "ORIGINAL CLIENTE",
                fontSize: 10,
                alignment: "left",
              },
              {
                text: "DUPLICADO ARCHIVO TRIBUTARIO",
                fontSize: 10,
                alignment: "right",
              },
            ],
          }
        );
      }

      // Crear un nombre de archivo descriptivo para descargas
      const nombreArchivo = tipoSalida === "download" 
        ? `Factura_${venta?.factura || venta?.codigo || 'venta'}_${new Date().toISOString().split('T')[0]}.pdf` 
        : undefined;

      // Generar el PDF con el contenido preparado
      await generatePDF(
        {
          pageSize: { width: 595.28, height: 841.89 },
          pageMargins: [2, 2, 2, 2],
          info: {
            title: `Factura ${venta?.factura}`,
            author: "Sistema de Ventas",
            subject: "Factura de Venta",
            keywords: "venta, factura",
          },
          content: contenidoPDF,
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            subheader: {
              fontSize: 14,
              bold: true,
              margin: [0, 10, 0, 5],
            },
            tableHeader: {
              bold: true,
              fontSize: 10,
              color: "black",
            },
          },
        },
        tipoSalida,
        nombreArchivo
      );

      toast({
        title: tipoSalida === "print" ? "PDF impreso con éxito" : "PDF generado con éxito",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error al generar PDF",
        description: "Hubo un problema al generar el documento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Effect para cargar datos
  useEffect(() => {
    const init = async () => {
      if (id_venta) {
        try {
          console.log("Iniciando carga de datos para venta:", id_venta);

          // Primero obtener configuraciones y venta
          await Promise.all([getConfiguraciones(), getVenta()]);

          // Luego obtener y procesar la imagen
          const imagenBase64 = await getEncabezadoFactura();

          // Verificar si se obtuvo una imagen para asegurarnos que se actualizó el estado
          if (imagenBase64) {
            console.log(
              "Imagen obtenida exitosamente, longitud:",
              imagenBase64.length
            );
          } else {
            console.warn("No se pudo obtener imagen de encabezado");
          }

          console.log(
            "Datos cargados exitosamente, headerImage disponible:",
            !!imagenBase64
          );
        } catch (error) {
          console.error("Error cargando datos:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos",
            status: "error",
            duration: 3000,
          });
        }
      }
    };

    init();
  }, [id_venta]);

  // Effect para manejar la impresión
  useEffect(() => {
    const imprimirSiDatosListos = async () => {
      console.log("Verificando condiciones para imprimir:", {
        onImprimir,
        prevOnImprimir,
        tieneVenta: !!venta,
        tieneConfiguraciones: !!configuraciones,
        tieneImagen: !!headerImage,
        headerImageLength: headerImage ? headerImage.length : 0,
      });

      // Solo intentar imprimir si:
      // 1. onImprimir es true
      // 2. No se ha impreso antes (prevOnImprimir es false)
      // 3. Tenemos todos los datos necesarios
      if (onImprimir && !prevOnImprimir && venta && configuraciones) {
        try {
          console.log("Esperando a que la imagen termine de cargarse...");

          // Esperar un poco para asegurar que la imagen esté totalmente cargada en el estado
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log("Iniciando generación de PDF con imagen:", !!headerImage);

          // Esperar a que se complete la generación del PDF
          await generarPDF(accion);
          console.log("PDF generado exitosamente");

          // Actualizar el estado después de una impresión exitosa
          setPrevOnImprimir(true);
        } catch (error) {
          console.error("Error generando PDF:", error);
          toast({
            title: "Error",
            description: "Error al generar el PDF",
            status: "error",
            duration: 3000,
          });
        }
      }
    };

    imprimirSiDatosListos();
  }, [onImprimir, venta, configuraciones, headerImage, accion]);

  // Effect para resetear el estado cuando cambia id_venta
  useEffect(() => {
    setPrevOnImprimir(false);
  }, [id_venta]);

  const getConfiguraciones = async () => {
    try {
      const response = await axios.get(`${api_url}configuraciones/todos`);
      setConfiguraciones(response.data.body);
    } catch (error) {
      console.error("Error al obtener las configuraciones:", error);
    }
  };

  const getVenta = async () => {
    try {
      const response = await axios.get(`${api_url}venta/venta-imprimir`, {
        params: {
          ventaId: id_venta,
        },
      });
      console.log(response.data.body);
      setVenta(response.data.body);
    } catch (error) {
      console.error("Error al obtener la venta:", error);
    }
  };

  return <div id="ticket"></div>;
};

export default ModeloFacturaReport;
