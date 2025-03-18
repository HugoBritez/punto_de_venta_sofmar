import { useState } from "react";
import { Articulo } from "../types/articulo.type";
import { articuloService } from "../services/articuloService";

const FormularioArticulo = () => {
  const [articulo, setArticulo] = useState<Articulo>();
  const [articuloFields, setArticuloFields] = useState<Partial<Articulo>>({});
  const usuario = sessionStorage.getItem("user_id");

  const handleCambio = (campo: keyof Articulo, valor: any) => {
    setArticuloFields({
      ...articuloFields,
      [campo]: valor,
    });
  };

  const handleCrearArticulo = async () => {
    try {
      const nuevoArticulo: Partial<Articulo> = {
        ...articuloFields,
        ar_fechaAlta: new Date().toISOString(),
        ar_usuarioAlta: Number(usuario),
        ar_estado: 1,
      };

      const response = await articuloService.crearArticulo(
        nuevoArticulo as Omit<Articulo, "ar_codigo">
      );
      console.log(response);
    } catch (error) {
      console.error("Error al crear el articulo", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-2">
      <div className="flex flex-col w-full h-full bg-white rounded-md shadow-xs">
        <div className="flex flex-row gap-2">
            <div className="flex flex-col w-1/2">

            </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioArticulo;
