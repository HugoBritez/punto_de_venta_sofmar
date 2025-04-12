import { Boxes, Plus } from "lucide-react"
import { useState } from "react"
import { UbicacionDTO, Ubicacion } from "./types/ubicaciones.type";

const GestionDirecciones = () => {
  const [ubicaciones, ] = useState<Ubicacion[]>([]);
  const [ubicacionDTO, setUbicacionDTO] = useState<UbicacionDTO>({
    calle_inicial: "",
    calle_final: "",
    predio_inicial: 0,
    predio_final: 0,
    piso_inicial: 0,
    piso_final: 0,
    direccion_inicial: 0,
    direccion_final: 0,
    estado:1,
    tipo_direccion:1,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setUbicacionDTO({
      ...ubicacionDTO,
      [name]: type === 'radio' ? Number(value) : type === 'number' ? Number(value) : value,
    })
  }


  return (
    <div className="flex flex-col gap-2 bg-gray-100 h-screen p-2">
      <div className="flex items-center gap-2 p-2 bg-blue-500 rounded-md ">
        <Boxes size={36} color="white" />
        <p className="text-white font-bold text-2xl">Gestion de Direcciones</p>
      </div>
      {/* FORM DE CREACION DE DIRECCIONES */}
      <div className="flex flex-col gap-2 border-4 border-gray-300 rounded-md p-2 bg-white ">
        <p className="font-bold text-xl ">
          Formulario de creacion de direcciones
        </p>
        <div className="flex flex-row gap-2">
          {/* TABLA DE DEFINICION DE DIRECCIONES */}
          <div className="flex flex-col">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2"></th>
                  <th className="border border-gray-300 px-4 py-2">CALLE</th>
                  <th className="border border-gray-300 px-4 py-2">PREDIO</th>
                  <th className="border border-gray-300 px-4 py-2">PISO</th>
                  <th className="border border-gray-300 px-4 py-2">
                    DIRECCION
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Inicial
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="calle_inicial"
                      value={ubicacionDTO.calle_inicial}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="predio_inicial"
                      value={ubicacionDTO.predio_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="piso_inicial"
                      value={ubicacionDTO.piso_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="direccion_inicial"
                      value={ubicacionDTO.direccion_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Final
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="calle_final"
                      value={ubicacionDTO.calle_final}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="predio_final"
                      value={ubicacionDTO.predio_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="piso_final"
                      value={ubicacionDTO.piso_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="direccion_final"
                      value={ubicacionDTO.direccion_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Tipo de dirección
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Dir. Items por caja
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="tipo_direccion"
                      value={1}
                      checked={ubicacionDTO.tipo_direccion === 1}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Dir. items fraccionados
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="tipo_direccion"
                      value={2}
                      checked={ubicacionDTO.tipo_direccion === 2}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Dir. de reserva
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="tipo_direccion"
                      value={3}
                      checked={ubicacionDTO.tipo_direccion === 3}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* LISTADO DE DIRECCIONES*/}
          <div className="flex flex-col gap-2 flex-1">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Lista de direcciones creadas
                  </th>
                  <th className="border border-gray-300 px-4 py-2" colSpan={2}>
                    <input
                      type="text"
                      placeholder="Buscar dirección"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {ubicaciones.length > 0 ? (
                  ubicaciones.map((ubicacion, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.calle}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.predio}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.piso}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.direccion}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.tipo_direccion}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                      colSpan={5}
                    >
                      No hay direcciones creadas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/*BOTONES Y FUNCIONES */}
          <div className="flex flex-col gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Crear dirección
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md">
              Eliminar dirección
            </button>
          </div>
        </div>
      </div>
      {/* FORMULARIO DE AGRUPACION DE DIRECCIONES */}
      <div className="flex flex-col gap-2 border-4 border-gray-300 rounded-md p-2 bg-white ">
        <p className="font-bold text-xl ">
          Formulario de agrupacion de direcciones
        </p>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2"></th>
                  <th className="border border-gray-300 px-4 py-2">CALLE</th>
                  <th className="border border-gray-300 px-4 py-2">PREDIO</th>
                  <th className="border border-gray-300 px-4 py-2">PISO</th>
                  <th className="border border-gray-300 px-4 py-2">
                    DIRECCION
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Inicial
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="calle_inicial"
                      value={ubicacionDTO.calle_inicial}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="predio_inicial"
                      value={ubicacionDTO.predio_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="piso_inicial"
                      value={ubicacionDTO.piso_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="direccion_inicial"
                      value={ubicacionDTO.direccion_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Final
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="calle_final"
                      value={ubicacionDTO.calle_final}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="predio_final"
                      value={ubicacionDTO.predio_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="piso_final"
                      value={ubicacionDTO.piso_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="direccion_final"
                      value={ubicacionDTO.direccion_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Tipo de zona
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA AA</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="tipo_direccion"
                      value={1}
                      checked={ubicacionDTO.tipo_direccion === 1}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA A</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="tipo_direccion"
                      value={2}
                      checked={ubicacionDTO.tipo_direccion === 2}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA B</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="tipo_direccion"
                      value={3}
                      checked={ubicacionDTO.tipo_direccion === 3}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA C</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="tipo_direccion"
                      value={3}
                      checked={ubicacionDTO.tipo_direccion === 3}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA D</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="tipo_direccion"
                      value={3}
                      checked={ubicacionDTO.tipo_direccion === 3}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* LISTADO DE DIRECCIONES*/}
          <div className="flex flex-col gap-2 flex-1">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Lista de direcciones en esta zona
                  </th>
                  <th className="border border-gray-300 px-4 py-2" colSpan={2}>
                    <input
                      type="text"
                      placeholder="Buscar dirección"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {ubicaciones.length > 0 ? (
                  ubicaciones.map((ubicacion, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.calle}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.predio}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.piso}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.direccion}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.tipo_direccion}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                      colSpan={5}
                    >
                      No hay direcciones en esta zona
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/*BOTONES Y FUNCIONES */}
          <div className="flex flex-col gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Agrupar direcciones
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md">
              Eliminar agrupación
            </button>
          </div>
        </div>
      </div>
      {/*FORMULARIO PARA RELACIONAR ITEMS CON SUS RESPECTIVA UBICACIONES */}
      <div className="flex flex-col gap-2 border-4 border-gray-300 rounded-md p-2 bg-white ">
        <p className="font-bold text-xl ">Insercion de items en direcciones</p>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2"></th>
                  <th className="border border-gray-300 px-4 py-2">CALLE</th>
                  <th className="border border-gray-300 px-4 py-2">PREDIO</th>
                  <th className="border border-gray-300 px-4 py-2">PISO</th>
                  <th className="border border-gray-300 px-4 py-2">
                    DIRECCION
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Inicial
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="calle_inicial"
                      value={ubicacionDTO.calle_inicial}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="predio_inicial"
                      value={ubicacionDTO.predio_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="piso_inicial"
                      value={ubicacionDTO.piso_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="direccion_inicial"
                      value={ubicacionDTO.direccion_inicial}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Final
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="calle_final"
                      value={ubicacionDTO.calle_final}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="predio_final"
                      value={ubicacionDTO.predio_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="piso_final"
                      value={ubicacionDTO.piso_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="direccion_final"
                      value={ubicacionDTO.direccion_final}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* LISTADO DE DIRECCIONES*/}
          <div className="flex flex-col gap-2 flex-1">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Lista de items por zona
                  </th>
                  <th className="border border-gray-300 px-4 py-2" colSpan={2}>
                    <input
                      type="text"
                      placeholder="Buscar items por nombre o codigo de barras"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {ubicaciones.length > 0 ? (
                  ubicaciones.map((ubicacion, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.calle}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.predio}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.piso}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.direccion}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion.tipo_direccion}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                      colSpan={5}
                    >
                      No hay items en esta zona
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    className="border border-gray-300 px-4 py-2 text-center text-gray-500 items-center justify-center"
                    colSpan={5}
                  >
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md flex flex-row gap-2 items-center justify-center">
                      <div className="flex flex-row gap-2 items-center justify-center">
                        Insertar items <Plus size={20} />
                      </div>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionDirecciones
