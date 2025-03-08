import { useEffect, useState } from "react";
import { useSucursalesStore } from "@/stores/sucursalesStore";
import { useDepositosStore } from "@/stores/depositosStore";
import { useMonedasStore } from "@/stores/monedasStore";
import { Box } from "@chakra-ui/react";
import { useListaPreciosStore } from "@/stores/listaPreciosStore";
import {
  ArticulosNuevo,
  Cliente,
  Deposito,
  ListaPrecios,
  Moneda,
  Sucursal,
} from "@/types/shared_interfaces";
import { Vendedor } from "@/types/shared_interfaces";
import { FileText, Plus, Printer } from "lucide-react";

const FormularioPresupuestos = () => {
  const { sucursales, fetchSucursales } = useSucursalesStore();
  const { depositos, fetchDepositos } = useDepositosStore();
  const { monedas, fetchMonedas } = useMonedasStore();
  const { listaPrecios, fetchListaPrecios } = useListaPreciosStore();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [articulos, setArticulos] = useState<ArticulosNuevo[]>([]);

  //estados para todo lo seleccionado
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [vendedorSeleccionado, setVendedorSeleccionado] =
    useState<Vendedor | null>(null);
  const [listaPrecioSeleccionada, setListaPrecioSeleccionada] =
    useState<ListaPrecios | null>(null);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(
    null
  );
  const [condicionPago, setCondicionPago] = useState<string>("");
  const [validezOferta, setValidezOferta] = useState<string>("");
  const [plazoEntrega, setPlazoEntrega] = useState<string>("");
  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<ArticulosNuevo | null>(null);
  const [tipoFlete, setTipoFlete] = useState<string>("");
  const [detalleAdicional, setDetalleAdicional] = useState<boolean>(false);
  const [consultarVentas, setConsultarVentas] = useState<boolean>(false);

  useEffect(() => {
    fetchSucursales();
    fetchDepositos();
    fetchMonedas();
    fetchListaPrecios();
  }, []);

  return (
    <Box
      w={"100%"}
      h={"100vh"}
      className="bg-gray-100"
      p={2}
      display={"flex"}
      flexDirection={"column"}
      gap={2}
    >
      <div className="flex flex-col gap-2 bg-blue-600 rounded-md h-[6%] justify-center px-4">
        <div className="flex flex-row gap-2 items-center">
          <p className="text-white font-bold text-xl">
            Registro de Presupuestos
          </p>
        </div>
      </div>
      <div className="bg-blue-100 rounded-md h-[20%] p-2 flex flex-col gap-2">
        <div className="flex flex-row gap-2 ">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-row gap-2 items-center">
              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="sucursal" className="text-black font-bold">
                  Sucursal
                </label>
                <select
                  name="sucursal"
                  id="sucursal"
                  className="bg-white rounded-md p-2"
                >
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="deposito" className="text-black font-bold">
                  Depósito
                </label>
                <select
                  name="deposito"
                  id="deposito"
                  className="bg-white rounded-md p-2"
                >
                  {depositos.map((deposito) => (
                    <option
                      key={deposito.dep_codigo}
                      value={deposito.dep_codigo}
                    >
                      {deposito.dep_descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="cliente" className="text-black font-bold">
                Cliente
              </label>
              <input
                type="numer"
                name="cliente_id"
                id="cliente_id"
                className="bg-white rounded-md p-2"
                placeholder="Buscar cliente por id" 
              />
              <input
                type="text"
                name="cliente_nombre"
                id="cliente_nombre"
                className="bg-white rounded-md p-2 w-full"
                placeholder="Buscar cliente por nombre"
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="vendedor" className="text-black font-bold">
                Vendedor
              </label>
              <input
                type="number"
                name="vendedor_id"
                id="vendedor_id"
                className="bg-white rounded-md p-2"
                placeholder="Buscar vendedor por id"
              />
              <input
                type="text"
                name="vendedor_nombre"
                id="vendedor_nombre"
                className="bg-white rounded-md p-2 w-full"
                placeholder="Buscar vendedor por nombre"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="fecha" className="text-black font-bold">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  id="fecha"
                  className="bg-white rounded-md p-2"
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="moneda" className="text-black font-bold">
                  Moneda
                </label>
                <select
                  name="moneda"
                  id="moneda"
                  className="bg-white rounded-md p-2"
                >
                  {monedas.map((moneda) => (
                    <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                      {moneda.mo_descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="operador" className="text-black font-bold">
                Operador
              </label>
              <input
                type="number"
                name="operador_id"
                id="operador_id"
                className="bg-white rounded-md p-2"
              />
              <input
                type="text"
                name="operador_nombre"
                id="operador_nombre"
                className="bg-white rounded-md p-2"
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="lista_precios" className="text-black font-bold">
                Lista de Precios
              </label>
              <select
                name="lista_precios"
                id="lista_precios"
                className="bg-white rounded-md p-2"
              >
                {listaPrecios.map((listaPrecio) => (
                  <option
                    key={listaPrecio.lp_codigo}
                    value={listaPrecio.lp_codigo}
                  >
                    {listaPrecio.lp_descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="condicion_pago" className="text-black font-bold">
                Condición de Pago
              </label>
              <input
                type="text"
                name="condicion_pago"
                id="condicion_pago"
                className="bg-white rounded-md p-2"
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="validez_oferta" className="text-black font-bold">
                Validez de Oferta
              </label>
              <input
                type="text"
                name="validez_oferta"
                id="validez_oferta"
                className="bg-white rounded-md p-2"
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="plazo_entrega" className="text-black font-bold">
                Plazo de Entrega
              </label>
              <input
                type="text"
                name="plazo_entrega"
                id="plazo_entrega"
                className="bg-white rounded-md p-2"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="tipo_flete" className="text-black font-bold">
                Tipo de Flete
              </label>
              <input
                type="text"
                name="tipo_flete"
                id="tipo_flete"
                className="bg-white rounded-md p-2"
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="recuperar" className="text-black font-bold">
                Para recuperar, presione "ENTER"
              </label>
              <input
                type="number"
                name="recuperar"
                id="recuperar"
                className="bg-white rounded-md p-2"
              />
            </div>

            <button
              onClick={() => setConsultarVentas(true)}
              className="bg-blue-600 text-white rounded-md p-2"
            >
              <p className="text-white font-bold">Consultar Ventas</p>
            </button>
            <div className="flex flex-row gap-2 items-center">
              <label
                htmlFor="detalle_adicional"
                className="text-black font-bold"
              >
                Detalle Adicional
              </label>
              <input
                type="checkbox"
                name="detalle_adicional"
                id="detalle_adicional"
                className="bg-white rounded-md p-2"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <input
            type="text"
            name="id_articulo"
            className="bg-white rounded-md p-2 w-1/12"
          />
          <input
            type="text"
            name="descripcion_articulo"
            className="bg-white rounded-md p-2 w-full"
            placeholder="Buscar Articulo por descripcion"
          />
          <input
            type="number"
            name="cantidad_articulo"
            id="cantidad_articulo"
            className="bg-white rounded-md p-2 w-1/12"
            placeholder="Cantidad"
          />
          <select
            name="lista_precio_articulo"
            id="lista_precio_articulo"
            className="bg-white rounded-md p-2"
          >
            {listaPrecios.map((listaPrecio) => (
              <option key={listaPrecio.lp_codigo} value={listaPrecio.lp_codigo}>
                {listaPrecio.lp_descripcion}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="precio_articulo"
            id="precio_articulo"
            className="bg-white rounded-md p-2"
            placeholder="Precio Unitario"
          />
          <input
            type="number"
            name="descuento_articulo"
            id="descuento_articulo"
            className="bg-white rounded-md p-2"
            placeholder="Descuento"
          />
          <input
            type="text"
            name="lote_articulo"
            id="lote_articulo"
            className="bg-white rounded-md p-2"
            placeholder="Lote"
            disabled
          />
          <input
            type="number"
            name="exentas_articulo"
            id="exentas_articulo"
            className="bg-white rounded-md p-2"
            placeholder="Exentas"
            disabled
          />
          <input
            type="number"
            name="cinco_articulo"
            id="cinco_articulo"
            className="bg-white rounded-md p-2"
            placeholder="5%"
            disabled
          />
          <input
            type="number"
            name="diez_articulo"
            id="diez_articulo"
            className="bg-white rounded-md p-2"
            placeholder="10%"
            disabled
          />
          <button className="bg-green-600 text-white rounded-md p-2">
            <Plus />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 bg-white rounded-md h-[43%] shadow-sm p-2 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-200 text-black rounded-md p-2">
            <tr className="[&>th]:p-2 [&>th]:border-r-2 [&>th]:border-y-2 [&>th]:border-gray-300">
              <th className="text-left border-l-2 border-gray-300">Codigo</th>
              <th className="text-left">Descripcion</th>
              <th>Cantidad</th>
              <th>Precio U.</th>
              <th>Descuento</th>
              <th>Exentas</th>
              <th>5%</th>
              <th>10%</th>
              <th>Lote</th>
              <th>Vence</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="flex flex-row gap-2 bg-blue-100 rounded-md h-[28%] p-2">
        <div className="flex flex-col gap-2 flex-1">
          <label
            htmlFor="observacion_presupuesto"
            className="text-black font-bold"
          >
            Observacion
          </label>
          <textarea
            name="observacion_presupuesto"
            id="observacion_presupuesto"
            className="bg-white rounded-md p-2 w-full h-full"
            placeholder="Observacion"

          ></textarea>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-row gap-2 items-center">
            <p className="text-black font-bold">Mostrar Subtotal</p>
            <input
              type="checkbox"
              name="mostrar_subtotal"
              id="mostrar_subtotal"
              className="bg-white rounded-md p-2"
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <p className="text-black font-bold">Mostrar Total</p>
            <input
              type="checkbox"
              name="mostrar_total"
              id="mostrar_total"
              className="bg-white rounded-md p-2"
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <p className="text-black font-bold">Mostrar Marca</p>
            <input
              type="checkbox"
              name="mostrar_total"
              id="mostrar_total"
              className="bg-white rounded-md p-2"
            />
          </div>
          <div className="flex flex-row gap-2 bg-white rounded-md p-2 justify-around">
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="checkbox"
                  name="mostrar_total"
                  id="mostrar_total"
                  className="bg-white rounded-md p-2"
                />
                <p className="text-black font-bold">Impresora</p>
              </div>
              <Printer size={60} color="green"/>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="checkbox"
                  name="mostrar_total"
                  id="mostrar_total"
                  className="bg-white rounded-md p-2"
                />
                <p className="text-black font-bold">PDF</p>
              </div>
              <FileText size={60} color="red"/>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_exentas" className="text-black font-bold">Total Exentas</label>
            <input
              type="number"
              name="total_exentas"
              id="total_exentas"
              className="bg-white rounded-md p-2 h-14 font-bold text-xl text-right text-black"
              placeholder="0.00"
              disabled
            />
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_cinco" className="text-black font-bold">Total 5%</label>
            <input
              type="number"
              name="total_cinco"
              id="total_cinco"
              className="bg-white rounded-md p-2 h-14 font-bold text-xl text-right text-black"
              placeholder="0.00"
              disabled
            />
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_diez" className="text-black font-bold">Total 10%</label>
            <input
              type="number"
              name="total_diez"
              id="total_diez"
              className="bg-white rounded-md p-2 h-14 font-bold text-xl text-right text-black"
              placeholder="0.00"
              disabled
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_factura" className="text-black font-bold">Total Factura</label>
            <input
              type="number"
              name="total_factura"
              id="total_factura"
              className="bg-white rounded-md p-2 h-20 font-bold text-3xl text-right text-black"
              placeholder="0.00"
              disabled
            />
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_descuentos" className="text-black font-bold">Total Descuentos por Items</label>
            <input
              type="number"
              name="total_descuentos"
              id="total_descuentos"
              className="bg-white rounded-md p-2 h-20 font-bold text-3xl text-right text-black  "
              placeholder="0.00"
              disabled
            />
          </div>
          <button className="bg-red-600 text-white rounded-md p-2">
            <p className="text-white font-bold">Cancelar</p>
          </button>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-2 ">
            <label htmlFor="descuento_factura" className="text-black font-bold">Descuento por Factura</label>
            <input
              type="number"
              name="descuento_factura"
              id="descuento_factura"  
              className="bg-white rounded-md p-2 h-20 font-bold text-3xl text-right text-black"
              placeholder="0.00"
              disabled
            />
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_a_pagar" className="text-black font-bold">Total a Pagar</label>
            <input
              type="number"
              name="total_a_pagar"
              id="total_a_pagar"
              className="bg-white rounded-md p-2 h-20 font-bold text-3xl text-right text-black"
              placeholder="0.00"
              disabled
            />
          </div>
          <button className="bg-green-600 text-white rounded-md p-2">
            <p className="text-white font-bold">Guardar</p>
          </button>
        </div>
      </div>
    </Box>
  );
};

export default FormularioPresupuestos;
