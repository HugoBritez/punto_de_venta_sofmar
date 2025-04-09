import { useState } from "react";
import { Articulo } from "../types/articulo.type";
import CategoriasSelect from "@/ui/select/CategoriasSelect";
// import { articuloService } from "../services/articuloService";

const FormularioArticulo = () => {
  // const [articulo, setArticulo] = useState<Articulo>();
  const [articuloFields, setArticuloFields] = useState<Partial<Articulo>>({});
  // const usuario = sessionStorage.getItem("user_id");

  const handleCambio = (campo: keyof Articulo, valor: any) => {
    setArticuloFields({
      ...articuloFields,
      [campo]: valor,
    });
  };

  // const handleCrearArticulo = async () => {
  //   try {
  //     const nuevoArticulo: Partial<Articulo> = {
  //       ...articuloFields,
  //       ar_fechaAlta: new Date().toISOString(),
  //       ar_usuarioAlta: Number(usuario),
  //       ar_estado: 1,
  //     };

  //     const response = await articuloService.crearArticulo(
  //       nuevoArticulo as Omit<Articulo, "ar_codigo">
  //     );
  //     console.log(response);
  //   } catch (error) {
  //     console.error("Error al crear el articulo", error);
  //   }
  // };

  const InputComponent = ({
    label,
    id,
    value,
    onChange,
    required,
    type = "text",
    className = "",
  }: {
    label: string;
    id: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    className?: string;
  }) => {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex flex-row gap-2">
          <label htmlFor={id} className="text-md font-bold">
            {label}
          </label>
          {required && <span className="text-red-500">*</span>}
        </div>
        <input
          type={type}
          id={id}
          className="w-full p-2 border border-gray-300 rounded-md"
          value={value}
          onChange={onChange}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-2">
      <div className="flex flex-col w-full h-full bg-white rounded-md shadow-xs">
        <div className="flex flex-row gap-2 p-2">
          <div className="flex flex-col w-1/2 border border-gray-300 rounded-md p-2">
            <InputComponent
              label="Descripción"
              id="descripcion_articulo"
              value={articuloFields.ar_descripcion}
              onChange={(e) => handleCambio("ar_descripcion", e.target.value)}
              required
            />
            <div className="flex flex-row gap-2">
              <InputComponent
                label="Código de barras"
                id="codbarra_articulo"
                value={articuloFields.ar_codbarra}
                onChange={(e) => handleCambio("ar_codbarra", e.target.value)}
                required
                className="w-full"
              />
              <InputComponent
                label="Código de origen"
                id="codorigen_articulo"
                value={articuloFields.ar_cod_interno}
                onChange={(e) => handleCambio("ar_cod_interno", e.target.value)}
                required
                type="number"
                className="w-full"
              />
              <InputComponent
                label="Código Marca origen"
                id="codmarca_articulo"
                value={articuloFields.ar_cod_marcas_origen}
                onChange={(e) =>
                  handleCambio("ar_cod_marcas_origen", e.target.value)
                }
                required
                type="number"
                className="w-full"
              />
            </div>
            <div className="flex flex-row gap-2">
              <InputComponent
                label="Principio activo"
                id="principio_activo"
                value={articuloFields.ar_principio_activo}
                onChange={(e) =>
                  handleCambio("ar_principio_activo", e.target.value)
                }
                className="w-full"
                required
                type="number"
              />
              <InputComponent
                label="Concentración (%)"
                id="concentracion"
                value={articuloFields.ar_concentracion}
                onChange={(e) =>
                  handleCambio("ar_concentracion", e.target.value)
                }
                type="number"
              />
            </div>
            <div className="flex flex-row gap-2">
              <InputComponent
                label="Cantidad por caja"
                id="cant_caja"
                value={articuloFields.ar_cant_caja}
                onChange={(e) => handleCambio("ar_cant_caja", e.target.value)}
                className="w-full"
                type="number"
              />
              <InputComponent
                label="Kilos"
                id="kilos"
                value={articuloFields.ar_kilos}
                onChange={(e) => handleCambio("ar_kilos", e.target.value)}
                className="w-full"
                type="number"
              />
              <InputComponent
                label="% Comisión"
                id="comision"
                value={articuloFields.ar_comision}
                onChange={(e) => handleCambio("ar_comision", e.target.value)}
                className="w-full"
              />
              <InputComponent
                label="% Desc. Max"
                id="desc_max"
                value={articuloFields.ar_descmax}
                onChange={(e) => handleCambio("ar_descmax", e.target.value)}
                className="w-full"
                type="number"
              />
              <InputComponent
                label="Stock mínimo"
                id="stock_minimo"
                value={articuloFields.ar_stkmin}
                onChange={(e) => handleCambio("ar_stkmin", e.target.value)}
                className="w-full"
                type="number"
              />
            </div>
          </div>
          <div className="flex flex-col w-1/2 border border-gray-300 rounded-md p-2">
            <div className="flex flex-row gap-2">
              <div className="flex flex-col gap-2 w-1/2">
                <CategoriasSelect
                  label="Categoría"
                  required
                  onChange={(categoriaId) =>
                    handleCambio("ar_subcategoria", categoriaId)
                  }
                  value={articuloFields.ar_subcategoria as number}
                />
              </div>
            </div>
            <div className="border border-red-500 w-full h-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioArticulo;
