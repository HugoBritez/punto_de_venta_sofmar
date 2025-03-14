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
  // Aquí puedes agregar más configuraciones fácilmente
];
