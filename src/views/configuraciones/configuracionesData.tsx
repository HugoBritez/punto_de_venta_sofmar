import { PictureInPicture } from "lucide-react";
import React from "react";

interface Configuracion {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
}

export const configuraciones: Configuracion[] = [
  {
    id: "encabezado-pie",
    nombre: "Encabezado y pie de nota de presupuesto",
    descripcion:
      "Configura las imágenes y textos que aparecen en el encabezado y pie de página de tus presupuestos",
    icono: <PictureInPicture />,
  },
  {
    id: "encabezado-factura",
    nombre: "Encabezado de la factura",
    descripcion:
      "Configura las imágenes y textos que aparecen en el encabezado de tus facturas",
    icono: <PictureInPicture />,
  },  
  {
    id: "factura",
    nombre: "Configuraciones de la factura",
    descripcion:
      "Configura los textos, tamaño de la página y cantidad de items por factura",
    icono: <PictureInPicture />,
  },
];
