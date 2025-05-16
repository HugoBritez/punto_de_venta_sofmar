import axios from "axios";
import { api_url } from "@/utils";
import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { generatePDF } from "@/shared/services/pdfService";
import configuracionesWebStore from "@/stores/configuracionesWebStore";

interface ModeloTicketProps {
  id_venta?: number;
  monto_entregado?: number;
  monto_recibido?: number;
  vuelto?: number;
  onImprimir?: boolean;
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
}

const ModeloFacturaGeneral = ({
  id_venta,
  onImprimir = false,
}: ModeloTicketProps) => {
  const { ajustesFactura, facturaConfig, configuracionesHeaderFactura } = configuracionesWebStore();
  const [venta, setVenta] = useState<VentaTicket | null>(null);
  const [prevOnImprimir, setPrevOnImprimir] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
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

  const monedaPalabra = (monto: string): string => {
    // Para montos en dólares, formatea con "XX/100"
    if (venta?.moneda === "DOLAR") {
      // Extraer los decimales
      const partes = venta?.total_a_pagar.toString().split(".");
      let centavos = "00";
      if (partes && partes.length > 1) {
        centavos = partes[1].padEnd(2, "0").substring(0, 2);
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
          resultado +=
            "Veinti" + (unidadTexto ? unidadTexto.toLowerCase() : "");
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

  const generarContenidoPDF = () => {
    if (!venta || !facturaConfig) return null;

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
        { text: detalle.codigo.toString(), fontSize: 6 },
        {
          text: detalle.cantidad.toString(),
          fontSize: 6,
          alignment: "center",
        },
        {
          text: descripcionArticulo(
            detalle.descripcion,
            detalle.lote,
            detalle.fecha_vencimiento,
            detalle.control_vencimiento
          ),
          fontSize: 6,
        },
        {
          text: `${(Number(detalle.precio) || 0).toLocaleString("es-PY")}`,
          fontSize: 6,
          alignment: "right",
        },
        {
          text: `${(Number(detalle.exentas) || 0).toLocaleString("es-PY")}`,
          fontSize: 6,
          alignment: "right",
        },
        {
          text: `${(Number(detalle.cinco) || 0).toLocaleString("es-PY")}`,
          fontSize: 6,
          alignment: "right",
        },
        {
          text: `${(Number(detalle.diez) || 0).toLocaleString("es-PY")}`,
          fontSize: 6,
          alignment: "right",
        },
      ]) || [];

    // Asegurar altura mínima de 5.5 cm (aproximadamente 8-10 filas)
    const minFilasRequeridas = parseInt(facturaConfig.items_p_factura) *3 || 10;
    const filasActuales = detallesVenta.length;

    // Si tenemos menos filas que el mínimo, añadir filas vacías
    if (filasActuales < minFilasRequeridas) {
      const filasVaciasNecesarias = minFilasRequeridas - filasActuales;
      for (let i = 0; i < filasVaciasNecesarias; i++) {
        detallesVenta.push([
          { text: "", fontSize: 6 },
          { text: "", fontSize: 6 },
          { text: "", fontSize: 6 },
          { text: "", fontSize: 6 },
          { text: "", fontSize: 6 },
          { text: "", fontSize: 6 },
          { text: "", fontSize: 6 },
        ]);
      }
    }

    return [
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
        layout: 'noBorders'
      } as any,
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
                  (venta?.total_cinco ? Number(venta.total_cinco) / 22 : 0) +
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
    ];
  };

  const generarPDF = async () => {
    try {
      const contenidoPDF = generarContenidoPDF();
      if (!contenidoPDF) return;

      // Obtener la cantidad de copias del store
      const cantidadCopias = parseInt(facturaConfig?.cantidad_copias || "2");

      // Generar múltiples copias del PDF
      for (let i = 0; i < cantidadCopias; i++) {
        // Modificar el texto según el número de copia
        const contenidoCopia = JSON.parse(JSON.stringify(contenidoPDF));
        const ultimoElemento = contenidoCopia[contenidoCopia.length - 1];
        const columnas = ultimoElemento.columns;
        const ultimaColumna = columnas[columnas.length - 1];
        
        // Cambiar el texto según el número de copia
        if (i === 0) {
          ultimaColumna.text = "Original: Cliente";
        } else {
          ultimaColumna.text = `Copia ${i}: ${i === 1 ? "Duplicado" : i === 2 ? "Triplicado" : `${i}º`}`;
        }

        await generatePDF(
          {
            pageSize: { 
              width: parseInt(facturaConfig?.ancho_pag || "595.28"), 
              height: parseInt(facturaConfig?.alto_pag || "841.89")
            },
            pageMargins: [2, 2, 2, 2],
            info: {
              title: `Factura ${venta?.factura} - ${i === 0 ? "Original" : `Copia ${i}`}`,
              author: "Sistema de Ventas",
              subject: "Factura de Venta",
              keywords: "venta, factura",
            },
            content: contenidoCopia,
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
          "print"
        );
      }

      toast({
        title: "PDF generado con éxito",
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
          await Promise.all([
            getVenta(),
            ajustesFactura(),
            configuracionesHeaderFactura()
          ]);
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
        tieneConfiguraciones: !!facturaConfig
      });

      // Solo intentar imprimir si:
      // 1. onImprimir es true
      // 2. No se ha impreso antes (prevOnImprimir es false)
      // 3. Tenemos todos los datos necesarios
      if (onImprimir && !prevOnImprimir && venta && facturaConfig) {
        try {
          await generarPDF();
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
      } else if (!onImprimir && venta && facturaConfig) {
        // Generar vista previa en base64
        try {
          const contenidoPDF = generarContenidoPDF();
          if (!contenidoPDF) return;

          // Obtener la cantidad de copias del store
          const cantidadCopias = parseInt(
            facturaConfig?.cantidad_copias || "1"
          );
          const todasLasCopias = [];

          // Generar contenido para cada copia
          for (let i = 0; i < cantidadCopias; i++) {
            const contenidoCopia = JSON.parse(JSON.stringify(contenidoPDF));
            const ultimoElemento = contenidoCopia[contenidoCopia.length - 1];
            const columnas = ultimoElemento.columns;
            const ultimaColumna = columnas[columnas.length - 1];

            // Cambiar el texto según el número de copia
            if (i === 0) {
              ultimaColumna.text = "Original: Cliente";
            } else {
              ultimaColumna.text = `Copia ${i}: ${
                i === 1 ? "Duplicado" : i === 2 ? "Triplicado" : `${i}º`
              }`;
            }

            // Agregar un salto de página entre copias si no es la última
            if (i < cantidadCopias - 1) {
              contenidoCopia.push({ text: "", pageBreak: "after" });
            }

            todasLasCopias.push(...contenidoCopia);
          }

          const result = await generatePDF(
            {
              pageSize: {
                width: parseInt(facturaConfig.ancho_pag) || 595.28,
                height: parseInt(facturaConfig.alto_pag) || 841.89,
              },
              pageMargins: [2, 2, 2, 2],
              info: {
                title: `Factura ${venta?.factura}`,
                author: "Sistema de Ventas",
                subject: "Factura de Venta",
                keywords: "venta, factura",
              },
              content: todasLasCopias,
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
            "b64"
          );

          if (result.success && result.content) {
            const pdfUrl = `data:application/pdf;base64,${result.content}`;
            setPdfPreviewUrl(pdfUrl);
          }
        } catch (error) {
          console.error("Error generando vista previa:", error);
        }
      }
    };

    imprimirSiDatosListos();
  }, [onImprimir, venta, facturaConfig]);

  // Effect para resetear el estado cuando cambia id_venta
  useEffect(() => {
    setPrevOnImprimir(false);
  }, [id_venta]);


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

  return (
    <div id="ticket">
      {!onImprimir && pdfPreviewUrl && (
        <iframe
          src={pdfPreviewUrl}
          className="w-full h-[700px] border border-gray-300 rounded-md"
          title="Vista previa del PDF"
        />
      )}
    </div>
  );
};

export default ModeloFacturaGeneral;
