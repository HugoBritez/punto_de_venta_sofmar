import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Upload, Settings, Eye } from "lucide-react";
import fallbackheader from "@/assets/logosdocumentos/fallbackheader.jpg";
import { generatePDF } from "@/shared/services/pdfService";
import { api_url } from "@/utils";
import axios from "axios";
import configuracionesWebStore from "@/stores/configuracionesWebStore";

const EncabezadoFacturaConfig = () => {
  const { configuracionesHeaderFactura, headerConfig, setHeaderConfig, guardarConfiguracionesHeaderFactura } =
    configuracionesWebStore();
  // Estados para las imágenes
  const [headerImage, setHeaderImage] = useState<string | null>(null);

  // Estados para las dimensiones
  const [headerWidth, setHeaderWidth] = useState<number>(550);
  const [headerHeight, setHeaderHeight] = useState<number>(80);

  // Estados para carga y guardado
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGeneratingPreview, setIsGeneratingPreview] =
    useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "success" | "error";
    texto: string;
  } | null>(null);

  // Referencias para los inputs de archivo
  const headerInputRef = useRef<HTMLInputElement>(null);

  // Estado para la previsualización
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  useEffect(() => {
    if (headerConfig) {
      setHeaderWidth(parseInt(headerConfig.ancho) || 550);
      setHeaderHeight(parseInt(headerConfig.alto) || 80);
    }
  }, [headerConfig]);

  const cargarConfiguracion = async () => {
    try {
      setIsLoading(true);
      await configuracionesHeaderFactura();

      try {
        const baseUrl = api_url.replace(/api\/?$/, "");

        // Función para verificar múltiples formatos de imagen
        const verificarImagenMultiformato = async (baseNombre: string) => {
          // Lista de extensiones comunes a probar
          const extensiones = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

          for (const ext of extensiones) {
            const url = `${baseUrl}upload/factura_images/${baseNombre}${ext}`;

            try {
              const response = await fetch(url, { method: "HEAD" });

              if (response.ok) {
                return url;
              }
            } catch (error) {
              // Ignorar errores 404 y otros errores de red
              continue;
            }
          }

          return null;
        };

        // Verificar header con múltiples formatos
        const headerUrl = await verificarImagenMultiformato("header");

        if (headerUrl) {
          setHeaderImage(headerUrl);
        }
      } catch (error) {
        console.error("Error al cargar imágenes del servidor:", error);
        // No mostrar error al usuario si no se encuentran las imágenes
      }
    } catch (error) {
      console.error("Error al cargar la configuración:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al cargar la configuración"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para subir la imagen al servidor
  const subirImagen = async (headerFile: File) => {
    const formData = new FormData();
    formData.append("imagen1", headerFile);

    const response = await axios.post(
      `${api_url}upload-factura-images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Error al subir la imagen");
    }

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || "Error al subir la imagen");
    }

    return `${api_url}upload/factura_images/${data.data.header.filename}`;
  };

  // Función para manejar la carga de imágenes
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Verificar tamaño (máximo 5MB según tu configuración en el servidor)
        if (file.size > 5 * 1024 * 1024) {
          setMensaje({
            tipo: "error",
            texto: "La imagen es demasiado grande. El tamaño máximo es 5MB.",
          });
          return;
        }

        setIsLoading(true);

        // Mostrar vista previa local inmediatamente
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setHeaderImage(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);

        // Intentar subir al servidor
        try {
          await subirImagen(file);

          setMensaje({
            tipo: "success",
            texto: "Imagen de encabezado subida correctamente",
          });

          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            setMensaje(null);
          }, 3000);
        } catch (error) {
          console.error("Error al subir al servidor:", error);

          setMensaje({
            tipo: "error",
            texto: "Error al subir la imagen al servidor. Se usará la versión local.",
          });

          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            setMensaje(null);
          }, 3000);
        }
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        setMensaje({
          tipo: "error",
          texto: "Error al procesar la imagen",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Función para guardar la configuración de dimensiones
  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);

      const config = {
        ancho: headerWidth.toString(),
        alto: headerHeight.toString()
      };

      const response = await guardarConfiguracionesHeaderFactura(config);

      if (response?.data?.success) {
        setMensaje({
          tipo: "success",
          texto: response.data.message || "Configuración guardada correctamente"
        });
        setHeaderConfig(config);
      } else {
        throw new Error(response?.data?.message || "Error al guardar la configuración");
      }

      setTimeout(() => {
        setMensaje(null);
      }, 3000);
    } catch (error: any) {
      console.error("Error:", error);
      setMensaje({
        tipo: "error",
        texto: error.message || "Error al guardar la configuración"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Función para generar la vista previa del PDF
  const generatePDFPreview = async () => {
    try {
      setIsGeneratingPreview(true);

      // Asegurarse de que tenemos la imagen en formato base64
      let logoHeader;

      // Convertir headerImage a base64 si es una URL
      if (headerImage) {
        if (headerImage.startsWith("data:")) {
          // Ya está en formato base64
          logoHeader = headerImage;
        } else {
          // Es una URL, necesitamos convertirla
          logoHeader = await convertImageToBase64(headerImage);
        }
      } else {
        logoHeader = await convertImageToBase64(fallbackheader);
      }

      // Crear una definición simplificada del documento
      const docDefinition = {
        pageSize: {
          width: 595.28,
          height: 841.89,
        },
        pageMargins: [20, 100, 20, 80],
        info: {
          title: "Vista Previa",
          author: "Sistema",
          subject: "Vista Previa de Configuración",
          keywords: "vista previa, configuración",
        },
        header: {
          margin: [20, 20, 20, 20],
          columns: [
            {
              image: logoHeader,
              width: headerWidth,
              height: headerHeight,
              alignment: "left",
            },
          ],
        },
        content: [
          {
            text: "VISTA PREVIA DE CONFIGURACIÓN",
            fontSize: 18,
            bold: true,
            alignment: "center",
            margin: [0, 20, 0, 20],
          },
          {
            text: "Este es un documento de muestra para visualizar cómo quedará configurado el encabezado.",
            fontSize: 12,
            margin: [0, 0, 0, 10],
          },
          {
            text: "Dimensiones del encabezado:",
            fontSize: 12,
            bold: true,
            margin: [0, 10, 0, 5],
          },
          {
            text: `Ancho: ${headerWidth}px, Alto: ${headerHeight}px`,
            fontSize: 12,
            margin: [0, 0, 0, 10],
          },
        ],
      };

      // Generar el PDF en base64
      const result = await generatePDF(docDefinition as any, "b64");

      if (result.success && result.content) {
        // Crear URL para el iframe
        const pdfUrl = `data:application/pdf;base64,${result.content}`;
        setPdfPreviewUrl(pdfUrl);
        setPreviewMode(true);
      } else {
        throw new Error(result.message || "Error al generar la vista previa");
      }
    } catch (error) {
      console.error("Error al generar vista previa:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al generar la vista previa del PDF",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Función para convertir imagen a base64
  const convertImageToBase64 = (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        try {
          const dataUrl = canvas.toDataURL("image/jpeg");
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Error loading image"));
      img.src = imgUrl;
    });
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Encabezado de factura
          </h2>
          {previewMode ? (
            <button
              className="px-4 py-2 rounded-md text-white bg-gray-600"
              onClick={() => {
                setPreviewMode(false);
                setPdfPreviewUrl(null);
              }}
            >
              Volver a edición
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded-md text-white bg-blue-600 flex items-center gap-2 disabled:bg-blue-300"
              onClick={generatePDFPreview}
              disabled={isGeneratingPreview}
            >
              {isGeneratingPreview ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Eye size={18} />
                  Vista previa PDF
                </>
              )}
            </button>
          )}
        </div>

        {/* Mensaje de éxito o error */}
        {mensaje && (
          <div
            className={`p-3 rounded-md ${
              mensaje.tipo === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            } flex items-center gap-2`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                mensaje.tipo === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            {mensaje.texto}
          </div>
        )}

        {/* Indicador de carga global */}
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {previewMode && pdfPreviewUrl ? (
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Vista previa del PDF</h3>
            <iframe
              src={pdfPreviewUrl}
              className="w-full h-[700px] border border-gray-300 rounded-md"
              title="Vista previa del PDF"
            />
          </div>
        ) : (
          <>
            {/* Configuración del Encabezado */}
            <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">Imagen de Encabezado</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-2 mb-4 h-[150px] flex items-center justify-center relative overflow-hidden">
                    {headerImage ? (
                      <img
                        src={headerImage}
                        alt="Encabezado"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Upload size={40} />
                        <p className="text-sm mt-2">
                          Ninguna imagen seleccionada
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm w-full hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-blue-300"
                    onClick={() => headerInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Upload size={16} />
                    )}
                    {isLoading ? "Subiendo..." : "Subir imagen"}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={headerInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="block font-medium mb-1 text-sm">
                        Ancho (px)
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="200"
                          max="800"
                          step="10"
                          value={headerWidth}
                          onChange={(e) =>
                            setHeaderWidth(Number(e.target.value))
                          }
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={headerWidth}
                          onChange={(e) =>
                            setHeaderWidth(Number(e.target.value))
                          }
                          className="w-20 p-1 border border-gray-300 rounded text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-sm">
                        Alto (px)
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="20"
                          max="200"
                          step="5"
                          value={headerHeight}
                          onChange={(e) =>
                            setHeaderHeight(Number(e.target.value))
                          }
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={headerHeight}
                          onChange={(e) =>
                            setHeaderHeight(Number(e.target.value))
                          }
                          className="w-20 p-1 border border-gray-300 rounded text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-300"
                onClick={handleSaveConfig}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Settings size={18} />
                    Guardar configuración
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EncabezadoFacturaConfig;
