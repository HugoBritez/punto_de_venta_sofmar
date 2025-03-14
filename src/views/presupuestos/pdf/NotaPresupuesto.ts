import { useEffect, useState, useRef } from "react";
import { generatePDF } from "@/services/pdfService";
import axios from "axios";
import { useSucursalStore } from "@/stores/sucursalStore";
import { api_url } from "@/utils";
// import logopresupuesto from "@/assets/logosdocumentos/logopresupuesto.jpg"
// import logopresupuestopie from "@/assets/logosdocumentos/logopresupuestopie.jpg"
import fallbackheader from  "@/assets/logosdocumentos/fallbackheader.jpg"
import fallbackfooter from "@/assets/logosdocumentos/fallbackfooter.jpg"


interface NotaPresupuestoProps {
  presupuesto: number;
  onComplete: () => void;
  onError: (error: any) => void;
  action: "print" | "download";
  mostrarSubtotal: boolean;
  mostrarTotal: boolean;
  mostrarMarca: boolean;
}

interface PresupuestoPDF {
  id: number;
  cliente_razon: string;
  cliente_ruc: string;
  cliente_direccion: string;
  condicion_pago: string;
  plazo_entrega: string;
  flete: string;
  subtotal: number;
  total: number;
  vendedor: string;
  observacion: string;
  items: {
    codigo_barra: string;
    descripcion: string;
    marca: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[];
}

export const NotaPresupuesto = ({
  presupuesto,
  onComplete,
  onError,
  action,
  mostrarSubtotal,
  mostrarTotal,
  mostrarMarca,
}: NotaPresupuestoProps) => {
  const { sucursalData, fetchSucursalData } = useSucursalStore((state) => ({
    sucursalData: state.sucursalData,
    fetchSucursalData: state.fetchSucursalData,
  }));

  // Nuevos estados para las imágenes y dimensiones
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [headerWidth, setHeaderWidth] = useState<number>(550);
  const [headerHeight, setHeaderHeight] = useState<number>(80);
  const [footerWidth, setFooterWidth] = useState<number>(550);
  const [footerHeight, setFooterHeight] = useState<number>(60);
  
  // Referencias para almacenar las imágenes base64 de forma inmediata
  const headerImageRef = useRef<string | null>(null);
  const footerImageRef = useRef<string | null>(null);

  const fecha_actual = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const usuario_actual = sessionStorage.getItem("user_name");

  useEffect(() => {
    console.log('Iniciando el componente');
    
    // Función principal para cargar todo
    const inicializarComponente = async () => {
      try {
        // Primero cargar configuración de dimensiones (síncrono)
        cargarConfiguracionDimensiones();
        
        // Luego cargar imágenes (asíncrono)
        await cargarImagenesServidor();
        
        // Finalmente, cuando las imágenes estén listas, obtener el presupuesto
        await fetchSucursalData();
        await getPresupuesto();
      } catch (error) {
        console.error("Error en la inicialización:", error);
        onError(error);
      }
    };
    
    // Cargar configuración de dimensiones
    const cargarConfiguracionDimensiones = () => {
      const configStr = localStorage.getItem("configuracionDimensionesPDF");
      if (configStr) {
        try {
          const config = JSON.parse(configStr);
          setHeaderWidth(config.headerWidth || 550);
          setHeaderHeight(config.headerHeight || 80);
          setFooterWidth(config.footerWidth || 550);
          setFooterHeight(config.footerHeight || 60);
        } catch (error) {
          console.error("Error al cargar configuración de dimensiones:", error);
        }
      }
    };

    // Cargar imágenes del servidor
    const cargarImagenesServidor = async () => {
      // Devolver una promesa que se resuelve cuando las imágenes están cargadas
      return new Promise<void>(async (resolve) => {
        try {
          const baseUrl = api_url.replace(/api\/?$/, "");

          // Función para verificar múltiples formatos de imagen
          const verificarImagenMultiformato = async (baseNombre: string) => {
            // Lista de extensiones comunes a probar
            const extensiones = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

            for (const ext of extensiones) {
              const url = `${baseUrl}upload/presupuesto_images/${baseNombre}${ext}`;
              console.log(`Intentando cargar ${baseNombre} desde: ${url}`);

              try {
                const response = await fetch(url, { method: "HEAD" });
                console.log(`Respuesta ${baseNombre}${ext}:`, response.status);

                if (response.ok) {
                  console.log(`${baseNombre}${ext} encontrado!`);
                  return url;
                }
              } catch (error) {
                console.error(`Error al verificar ${baseNombre}${ext}:`, error);
              }
            }

            console.log(`No se encontró ninguna imagen para ${baseNombre}`);
            return null;
          };

          // Verificar header con múltiples formatos
          const headerUrl = await verificarImagenMultiformato("header");
          if (headerUrl) {
            console.log("Header encontrado, estableciendo URL:", headerUrl);
            // Convertir inmediatamente a base64 para evitar problemas CORS más tarde
            try {
              const headerBase64 = await convertImageToBase64(headerUrl);
              console.log("Header convertido a base64 exitosamente");
              // Guardar en el estado y en la referencia
              setHeaderImage(headerBase64);
              headerImageRef.current = headerBase64;
            } catch (error) {
              console.error("Error al convertir header a base64:", error);
              const fallbackBase64 = await cargarImagenFallback(fallbackheader);
              setHeaderImage(fallbackBase64);
              headerImageRef.current = fallbackBase64;
            }
          } else {
            console.log("Header no encontrado, usando fallback");
            const fallbackBase64 = await cargarImagenFallback(fallbackheader);
            setHeaderImage(fallbackBase64);
            headerImageRef.current = fallbackBase64;
          }

          // Verificar footer con múltiples formatos
          const footerUrl = await verificarImagenMultiformato("footer");
          if (footerUrl) {
            console.log("Footer encontrado, estableciendo URL:", footerUrl);
            // Convertir inmediatamente a base64 para evitar problemas CORS más tarde
            try {
              const footerBase64 = await convertImageToBase64(footerUrl);
              console.log("Footer convertido a base64 exitosamente");
              // Guardar en el estado y en la referencia
              setFooterImage(footerBase64);
              footerImageRef.current = footerBase64;
            } catch (error) {
              console.error("Error al convertir footer a base64:", error);
              const fallbackBase64 = await cargarImagenFallback(fallbackfooter);
              setFooterImage(fallbackBase64);
              footerImageRef.current = fallbackBase64;
            }
          } else {
            console.log("Footer no encontrado, usando fallback");
            const fallbackBase64 = await cargarImagenFallback(fallbackfooter);
            setFooterImage(fallbackBase64);
            footerImageRef.current = fallbackBase64;
          }
          
          // Esperar un momento para asegurar que los estados se actualicen
          setTimeout(() => {
            console.log("Imágenes cargadas y convertidas a base64");
            resolve();
          }, 500);
        } catch (error) {
          console.error("Error al cargar imágenes del servidor:", error);
          setHeaderImage(null);
          setFooterImage(null);
          headerImageRef.current = null;
          footerImageRef.current = null;
          
          // Aún así, resolver la promesa para continuar
          setTimeout(resolve, 500);
        }
      });
    };

    // Función auxiliar para cargar imágenes fallback
    const cargarImagenFallback = async (src: string): Promise<string> => {
      return new Promise<string>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          resolve(dataUrl);
        };
        img.onerror = () => {
          console.error("Error al cargar imagen fallback");
          // Crear una imagen en blanco como último recurso
          const canvas = document.createElement("canvas");
          canvas.width = 100;
          canvas.height = 100;
          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          resolve(dataUrl);
        };
      });
    };

    // Iniciar la carga
    inicializarComponente();
  }, []);

  const convertImageToBase64 = (imgUrl: string): Promise<string> => {
    console.log("⭐ Iniciando convertImageToBase64 con URL:", imgUrl);
    return new Promise((resolve, reject) => {
      // Si ya es base64, simplemente devolver
      if (imgUrl.startsWith("data:")) {
        console.log("✅ La imagen ya está en formato base64, retornando directamente");
        resolve(imgUrl);
        return;
      }

      // Para URLs externas, necesitamos manejar CORS
      const img = new Image();
      img.crossOrigin = "Anonymous";
      console.log("🔄 Configurando crossOrigin a Anonymous");

      img.onload = () => {
        console.log("✅ Imagen cargada correctamente, dimensiones:", img.width, "x", img.height);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          console.log("🔄 Canvas creado con dimensiones:", canvas.width, "x", canvas.height);

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.error("❌ No se pudo obtener el contexto del canvas");
            reject(new Error("No se pudo obtener el contexto del canvas"));
            return;
          }

          console.log("🔄 Dibujando imagen en canvas");
          ctx.drawImage(img, 0, 0);

          // Intentar obtener el dataURL
          try {
            console.log("🔄 Convirtiendo canvas a dataURL");
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95); // Añadir calidad 0.95
            console.log("✅ Conversión exitosa, primeros 50 caracteres:", dataUrl.substring(0, 50));
            console.log("✅ Longitud total del dataURL:", dataUrl.length);
            resolve(dataUrl);
          } catch (error) {
            console.error("❌ Error al convertir canvas a dataURL:", error);
            reject(error);
          }
        } catch (error) {
          console.error("❌ Error en el proceso de canvas:", error);
          reject(error);
        }
      };

      img.onerror = (e) => {
        console.error("❌ Error al cargar la imagen:", e);
        console.error("❌ URL que falló:", imgUrl);
        reject(new Error(`Error loading image from ${imgUrl}`));
      };

      // Añadir timestamp para evitar caché
      const urlWithCache = imgUrl.includes("?")
        ? `${imgUrl}&_t=${new Date().getTime()}`
        : `${imgUrl}?_t=${new Date().getTime()}`;

      console.log("🔄 Cargando imagen desde URL con cache-busting:", urlWithCache);
      img.src = urlWithCache;
      console.log("🔄 Solicitud de carga iniciada");
    });
  };

  const getPresupuesto = async () => {
    try {
      console.log('Empezando a obtener el presupuesto');
      console.log('Estado de las imágenes antes de obtener presupuesto:');
      console.log('headerImage:', headerImage ? 'Cargado (primeros 20 caracteres): ' + headerImage.substring(0, 20) : 'No cargado');
      console.log('footerImage:', footerImage ? 'Cargado (primeros 20 caracteres): ' + footerImage.substring(0, 20) : 'No cargado');
      
      const response = await axios.get(
        `${api_url}presupuestos/imprimir-presupuesto`,
        {
          params: {
            id: presupuesto,
          },
        }
      );
      const data = response.data.body;
      
      if (data) {
        console.log('El presupuesto es', data);
        await generarPDF(data);
      } else {
        onError("No se encontraron datos del presupuesto");
      }
    } catch (error) {
      onError(error);
    }
  };

  const generarPDF = async (presupuestoData: PresupuestoPDF) => {
    try {
      console.log("🚀 Iniciando generación de PDF");
      
      // Verificar si las imágenes se están cargando correctamente
      console.log("📄 Estado actual de headerImage:", headerImage);
      console.log("📄 Estado actual de footerImage:", footerImage);
      console.log("📄 Estado actual de headerImageRef:", headerImageRef.current);
      console.log("📄 Estado actual de footerImageRef:", footerImageRef.current);
      
      // Verificar las dimensiones configuradas
      console.log("📏 Dimensiones configuradas:");
      console.log(`   Header: ${headerWidth}x${headerHeight}`);
      console.log(`   Footer: ${footerWidth}x${footerHeight}`);
      
      // Usar las imágenes cargadas del servidor o las fallback
      let logoHeader, logoFooter;
      
      // Primero intentar usar las referencias, luego los estados, y finalmente los fallbacks
      if (headerImageRef.current) {
        console.log('✅ Usando headerImageRef');
        logoHeader = headerImageRef.current;
      } else if (headerImage) {
        console.log('✅ Usando headerImage del estado');
        logoHeader = headerImage;
      } else {
        console.log('🔄 No hay headerImage, usando fallback');
        logoHeader = await convertImageToBase64(fallbackheader);
      }
      
      if (footerImageRef.current) {
        console.log('✅ Usando footerImageRef');
        logoFooter = footerImageRef.current;
      } else if (footerImage) {
        console.log('✅ Usando footerImage del estado');
        logoFooter = footerImage;
      } else {
        console.log('🔄 No hay footerImage, usando fallback');
        logoFooter = await convertImageToBase64(fallbackfooter);
      }

      // Verificar que las imágenes se hayan convertido correctamente
      console.log('🔍 Verificación de imágenes:');
      console.log(`   Header base64 (primeros 50 caracteres): ${logoHeader?.substring(0, 50)}...`);
      console.log(`   Header longitud total: ${logoHeader?.length}`);
      console.log(`   Footer base64 (primeros 50 caracteres): ${logoFooter?.substring(0, 50)}...`);
      console.log(`   Footer longitud total: ${logoFooter?.length}`);

      // Definir los anchos de columna según mostrarMarca
      const tableWidths = mostrarMarca 
        ? ["auto", "*", "auto", "auto", "auto", "auto"] 
        : ["auto", "*", "auto", "auto", "auto"];

      // Crear los encabezados según mostrarMarca
      let headerRow = [];
      if (mostrarMarca) {
        headerRow = [
          { text: "Cod. Barras", fontSize: 10, width: "*" },
          { text: "Descripción", fontSize: 10, width: "*" },
          { text: "Marca", fontSize: 10, width: "*" },
          { text: "Cantidad", fontSize: 10, width: "*" },
          { text: "Precio", fontSize: 10, width: "*" },
          { text: "Subtotal", fontSize: 10, width: "*" }
        ];
      } else {
        headerRow = [
          { text: "Cod. Barras", fontSize: 10, width: "*" },
          { text: "Descripción", fontSize: 10, width: "*" },
          { text: "Cantidad", fontSize: 10, width: "*" },
          { text: "Precio", fontSize: 10, width: "*" },
          { text: "Subtotal", fontSize: 10, width: "*" }
        ];
      }

      // Crear las filas de detalles según mostrarMarca
      const detallesItems = presupuestoData.items.map((item) => {
        if (mostrarMarca) {
          return [
            { text: item.codigo_barra, fontSize: 8, width: "*" },
            { text: item.descripcion, fontSize: 8, width: "*" },
            { text: item.marca, fontSize: 8, width: "*" },
            { text: item.cantidad, fontSize: 8, width: "*", alignment: "center" },
            { text: item.precio, fontSize: 8, width: "*", alignment: "right" },
            { text: item.subtotal, fontSize: 8, width: "*", alignment: "right" }
          ];
        } else {
          return [
            { text: item.codigo_barra, fontSize: 8, width: "*" },
            { text: item.descripcion, fontSize: 8, width: "*" },
            { text: item.cantidad, fontSize: 8, width: "*", alignment: "center" },
            { text: item.precio, fontSize: 8, width: "*", alignment: "right" },
            { text: item.subtotal, fontSize: 8, width: "*", alignment: "right" }
          ];
        }
      });

      // Asegurar altura mínima (aproximadamente 15 filas)
      const minFilasRequeridas = 20;
      const filasActuales = detallesItems.length;

      // Si tenemos menos filas que el mínimo, añadir filas vacías
      if (filasActuales < minFilasRequeridas) {
        const filasVaciasNecesarias = minFilasRequeridas - filasActuales;
        for (let i = 0; i < filasVaciasNecesarias; i++) {
          if (mostrarMarca) {
            detallesItems.push([
              { text: " ", fontSize: 8, width: "*" },
              { text: " ", fontSize: 8, width: "*" },
              { text: " ", fontSize: 8, width: "*" },
              { text: " " as unknown as number, fontSize: 8, width: "*", alignment: "center" },
              { text: " " as unknown as number, fontSize: 8, width: "*", alignment: "right" },
              { text: " " as unknown as number, fontSize: 8, width: "*", alignment: "right" }
            ]);
          } else {
            detallesItems.push([
              { text: " ", fontSize: 8, width: "*" },
              { text: " ", fontSize: 8, width: "*" },
              { text: " " as unknown as number, fontSize: 8, width: "*", alignment: "center" },
              { text: " " as unknown as number, fontSize: 8, width: "*", alignment: "right" },
              { text: " " as unknown as number, fontSize: 8, width: "*", alignment: "right" }
            ]);
          }
        }
      }

      const docDefinition = {
        pageSize: {
          width: 595.28,
          height: 841.89,
        },
        pageMargins: [20, 100, 20, 80],
        info: {
          title: "Nota de Presupuesto",
          author: sucursalData?.nombre_emp || "Sistema",
          subject: "Nota de Presupuesto",
          keywords: "presupuesto, nota",
        },
        header: {
          margin: [20, 20, 20, 20],
          columns: [
            {
              image: logoHeader,
              width: headerWidth,
              height: headerHeight,
              alignment: "left",
              fit: [headerWidth, headerHeight]
            },
          ],
        },
        // Definición del pie de página
        footer: {
          margin: [20, 0, 20, 5],
          columns: [
            {
              image: logoFooter,
              width: footerWidth,
              height: footerHeight,
              alignment: "left",
              fit: [footerWidth, footerHeight]
            }
          ],
        },
        content: [
          {
            columns: [
              {
                text: `Fecha: ${fecha_actual}`,
                fontSize: 10,
                width: "*",
                alignment: "left",
              },
              {
                text: `Hecho por ${usuario_actual}`,
                fontSize: 10,
                width: "*",
                alignment: "right",
              },
            ],
            margin: [0, 10, 0, 0],
          },
          {
            columns: [
              {
                text: `Cliente: ${presupuestoData.cliente_razon}`,
                fontSize: 10,
                width: "*",
                alignment: "left",
              },
              {
                text: `RUC: ${presupuestoData.cliente_ruc}`,
                fontSize: 10,
                width: "*",
                alignment: "right",
              },
            ],
            margin: [0, 10, 0, 0],
          },
          {
            text: `Dirección: ${presupuestoData.cliente_direccion}`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            columns: [
              {
                width: "auto",
                table: {
                  widths: ["auto"],
                  body: [
                    [
                      {
                        text: `Presupuesto Nro. ${presupuestoData.id}`,
                        fontSize: 10,
                        bold: true,
                        alignment: "center",
                        margin: [8, 4, 8, 4],
                      },
                    ],
                  ],
                },
                height: 800,
                layout: {
                  hLineWidth: function () {
                    return 2;
                  },
                  vLineWidth: function () {
                    return 2;
                  },
                  hLineColor: function () {
                    return "#333333";
                  },
                  vLineColor: function () {
                    return "#333333";
                  },
                  paddingLeft: function () {
                    return 4;
                  },
                  paddingRight: function () {
                    return 4;
                  },
                  paddingTop: function () {
                    return 2;
                  },
                  paddingBottom: function () {
                    return 2;
                  },
                },
              },
              {
                text: "De nuestra consideración, nos dirigimos a usted con el objeto de informarle acerca del SIGUENTE PRESUPUESTO QUE EXPRESA, LOS PRECIOS, CONDICIONES DE PAGO Y PLAZO DE ENTREGA ESTABLECIDOS POR EL ASESOR DE VENTAS",
                fontSize: 8,
                width: "*",
                alignment: "left",
                margin: [15, 0, 0, 0],
              },
            ],
            margin: [0, 10, 0, 0],
          },
          {
            table: {
              headerRows: 1,
              widths: tableWidths,
              body: [
                headerRow,
                ...detallesItems,
              ],
            },
            margin: [0, 10, 0, 10],
            layout: {
              hLineWidth: function (i: number, node: any) {
                return i === 0 || i === 1 || i === node.table.body.length
                  ? 1
                  : 0;
              },
              vLineWidth: function () {
                return 0;
              },
              paddingLeft: function () {
                return 6;
              },
              paddingRight: function () {
                return 6;
              },
              paddingTop: function () {
                return 3;
              },
              paddingBottom: function () {
                return 3;
              },
            },
          },
          {
            columns: [
              {
                text: `Obs.: ${presupuestoData.observacion}`,
                fontSize: 10,
                width: "*",
              },
              {
                text: `${mostrarSubtotal ? `Subtotal: ${presupuestoData.subtotal}` : ''}`,
                fontSize: 10,
                width: "*",
                alignment: "right",
              },
            ],
          },
          {
            text: `${mostrarTotal ? `Total: ${presupuestoData.total}` : ''}`,
            fontSize: 10,
            width: "*",
            alignment: "right",
          },
          {
            text: `Este presupuesto tiene una validez de ${presupuestoData.plazo_entrega}`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            text: `Todos los precios incluyen  IVA`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            text: `CONDICION DE PAGO: ${presupuestoData.condicion_pago}`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            text: ` ${presupuestoData.condicion_pago}, a partir de la confirmacion y pago de la entrega del mismo `,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            text: `Flete: ${presupuestoData.flete}`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            columns: [
              {
                stack: [
                  {
                    text: "_______________________________",
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                  {
                    text: `Vendedor: ${presupuestoData.vendedor}`,
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                ],
              },
              {
                stack: [
                  {
                    text: "_______________________________",
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                  {
                    text: `GERENTE COMERCIAL`,
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                ],
              },
            ],
            margin: [0, 50, 0, 0],
          },
        ],
      };

      console.log("🔄 Llamando a generatePDF");
      const result = await generatePDF(docDefinition as any, action);
      console.log("✅ Resultado de generatePDF:", result);

      if (result.success) {
        console.log("PDF generado exitosamente");
        onComplete?.();
      } else {
        console.error("Error al generar PDF:", result.message);
        onError?.(result.message);
      }
    } catch (error) {
      console.error("❌ Error en generarPDF:", error);
      onError(error);
    }
  };

  return null;
};
