// import { useDepositosStore } from "@/stores/depositosStore";
// import { useSucursalesStore } from "@/stores/sucursalesStore";
// import { OperadorAdapter, useOperadoresStore } from "@/stores/operadoresStore";

// import { Articulo } from "@/ui/articulos/types/articulo.type";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { getArticulosPorCodBarra } from "@/ui/articulos/services/articuloPorCodBarraService";
// import { useMonedasStore } from "@/stores/monedasStore";
// import {
//   DetallePedidoDTO,
//   PedidoDTO,
//   DetallePedidoTabla,
// } from "./types/shared.type";
// import { useListaPreciosStore } from "@/stores/listaPreciosStore";
// import { Operador } from "@/stores/operadoresStore";
// import {
//   Cliente,
//   Deposito,
//   ListaPrecios,
//   Moneda,
//   Sucursal,
//   Vendedor,
// } from "@/types/shared_interfaces";
// import { useToast } from "@chakra-ui/react";
// import { agregarItemPedido } from "./services/pedidoServices";
// import { calcularTotalesPedido } from "./utils/calcularTotales";
// import { ShoppingCartIcon } from "lucide-react";
// import { useClientesStore } from "@/stores/clientesStore";
// const FormularioPedidos = () => {
//   const { sucursales, fetchSucursales } = useSucursalesStore();
//   const { depositos, fetchDepositos } = useDepositosStore();
//   const { vendedorSeleccionado, getOperadorPorCodInterno } =
//     useOperadoresStore();
//   const { listaPrecios, fetchListaPrecios } = useListaPreciosStore();
//   const { monedas, fetchMonedas } = useMonedasStore();
//   const { clienteSeleccionado, cargarClientesPorId } = useClientesStore();
//   const [articulos, setArticulos] = useState<Articulo[]>([]);
//   const [precioSeleccionado, setPrecioSeleccionado] = useState<ListaPrecios>();
//   const [depositoSeleccionado, setDepositoSeleccionado] = useState<Deposito>();
//   const [sucursalSeleccionada, setSucursalSeleccionada] = useState<Sucursal>();
//   const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda>();

//   const [fechaPedido, setFechaPedido] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );

//   const [busquedaCliente, setBusquedaCliente] = useState<string>("");
//   const [busquedaVendedor, setBusquedaVendedor] = useState<string>("");

//   const user = sessionStorage.getItem("user_name");

//   const [pedidoDTO, setPedidoDTO] = useState<PedidoDTO>({
//     p_fecha: fechaPedido,
//     p_nro_pedido: "",
//     p_cliente: 0,
//     p_operador: 0,
//     p_moneda: 0,
//     p_deposito: 0,
//     p_sucursal: 0,
//     p_descuento: 0,
//     p_obs: "",
//     p_estado: 0,
//     p_vendedor: 0,
//     p_area: 0,
//     p_tipo_estado: 0,
//     p_credito: 0,
//     p_imprimir: 0,
//     p_interno: 0,
//     p_latitud: 0,
//     p_longitud: 0,
//     p_tipo: 0,
//     p_entrega: 0,
//     p_cantcuotas: 0,
//     p_consignacion: 0,
//     p_autorizar_a_contado: 0,
//     p_zona: 0,
//     p_acuerdo: 0,
//     p_imprimir_preparacion: 0,
//     p_cantidad_cajas: 0,
//     p_preparado_por: 0,
//     p_verificado_por: 0,
//   });
//   const [detallePedido, setDetallePedido] = useState<DetallePedidoTabla[]>([]);

//   const [articulo, setArticulo] = useState<Articulo>();

//   const vendedorRef = useRef<HTMLInputElement>(null);
//   const clienteRef = useRef<HTMLInputElement>(null);
//   const articuloCodigoRef = useRef<HTMLInputElement>(null);
//   const cantidadRef = useRef<HTMLInputElement>(null);

//   const [modalArticulosOpen, setModalArticulosOpen] = useState(false);
//   const [modalClientesOpen, setModalClientesOpen] = useState(false);
//   const [modalVendedoresOpen, setModalVendedoresOpen] = useState(false);

//   const [codigoBarraArticulo, setCodigoBarraArticulo] = useState("");

//   const [articuloParams, setArticuloParams] = useState<{
//     cantidad: number;
//     precioUnitario: number;
//     descuento: number;
//     bonificacion: number;
//   }>({
//     cantidad: 1,
//     precioUnitario: 0,
//     descuento: 0,
//     bonificacion: 0,
//   });

//   const toast = useToast();

//   const handleBusquedaPorCodigoBarra = async (busqueda: string) => {
//     if (depositoSeleccionado?.dep_codigo && monedaSeleccionada?.mo_codigo) {
//       const articulo = await getArticulosPorCodBarra(
//         busqueda,
//         depositoSeleccionado?.dep_codigo,
//         0,
//         monedaSeleccionada?.mo_codigo
//       );
//       if (articulo) {
//         setArticulo(articulo);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchMonedas();
//     fetchSucursales();
//     fetchDepositos();
//     fetchListaPrecios();
//   }, []);

//   const handleAgregarItem = (
//     articulo: Articulo,
//     cantidad: number,
//     precioUnitario?: number,
//     descuento?: number,
//     bonificacion?: number
//   ) => {
//     const resultado = agregarItemPedido(detallePedido, {
//       articulo,
//       cantidad,
//       precioSeleccionado: precioSeleccionado!,
//       monedaSeleccionada: monedaSeleccionada!,
//       depositoSeleccionado: depositoSeleccionado!,
//       sucursalSeleccionada: sucursalSeleccionada!,
//       vendedorSeleccionado: vendedorSeleccionado!,
//       precioUnitario,
//       descuento,
//       bonificacion,
//     });

//     if (!resultado.ok) {
//       toast({
//         title: "Error",
//         description: resultado.error,
//         status: "info",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setDetallePedido(resultado.detallePedido!);
//     setArticulo(undefined);
//     setArticuloParams({
//       cantidad: 1,
//       precioUnitario: 0,
//       descuento: 0,
//       bonificacion: 0,
//     });
//   };

//   //EFFECT PARA SELECCIONAR POR DEFECTO
//   useEffect(() => {
//     if (listaPrecios.length > 0) {
//       setPrecioSeleccionado(listaPrecios[0]);
//     }
//     if (depositos.length > 0) {
//       setDepositoSeleccionado(depositos[0]);
//     }
//     if (sucursales.length > 0) {
//       setSucursalSeleccionada(sucursales[0]);
//     }
//     if (monedas.length > 0) {
//       setMonedaSeleccionada(monedas[0]);
//     }
//   }, [listaPrecios, depositos, sucursales, monedas]);

//   const totales = useMemo(
//     () => calcularTotalesPedido(detallePedido),
//     [detallePedido]
//   );

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setPedidoDTO({ ...pedidoDTO, [name]: value });
//   };

//   useEffect(() => {
//     if (clienteSeleccionado) {
//       setPedidoDTO((prev) => ({
//         ...prev,
//         p_cliente: clienteSeleccionado.cli_codigo,
//       }));
//     }

//     if (vendedorSeleccionado) {
//       console.log("vendedorSeleccionado", vendedorSeleccionado);
//       setPedidoDTO((prev) => ({
//         ...prev,
//         p_vendedor: vendedorSeleccionado.op_codigo,
//       }));
//     }
//   }, [clienteSeleccionado, vendedorSeleccionado]);

//   return (
//     <div className="flex h-screen w-full bg-gray-100 flex-col gap-2 p-2">
//       <div className="flex flex-row p-2 rounded-sm bg-blue-500">
//         <ShoppingCartIcon className="w-8 h-8 text-white mr-2" />
//         <p className="text-white font-bold text-2xl ">Formulario de Pedidos</p>
//       </div>
//       <div className="flex flex-row rounded-sm bg-blue-300 shadow-xs p-2 gap-2">
//         <div className="flex flex-col ">
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="fechaPedido" className="text-sm font-bold">
//               Fecha:
//             </label>
//             <input
//               type="date"
//               id="fechaPedido"
//               className="rounded-md p-1 border-2 border-gray-300"
//               value={fechaPedido}
//               onChange={(e) => setFechaPedido(e.target.value)}
//             />
//           </div>
//           <div className="flex flex-col gap-2 ">
//             <label htmlFor="fechaPedido" className="text-sm font-bold">
//               Operador:
//             </label>
//             <input
//               type="text"
//               id="operador"
//               className="rounded-md p-1 border-2 border-gray-300"
//               value={user || ""}
//               readOnly
//             />
//           </div>
//         </div>
//         <div className="flex flex-col gap-2">
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="sucursal" className="text-sm font-bold">
//               Sucursal:
//             </label>
//             <select
//               name="sucursal"
//               id="sucursal"
//               className="rounded-md p-1 border-2 border-gray-300"
//               onChange={(e) =>
//                 setSucursalSeleccionada(
//                   sucursales.find(
//                     (sucursal) => sucursal.id === Number(e.target.value)
//                   )
//                 )
//               }
//               value={sucursalSeleccionada?.descripcion}
//             >
//               {sucursales.map((sucursal) => (
//                 <option key={sucursal.id} value={sucursal.id}>
//                   {sucursal.descripcion}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="deposito" className="text-sm font-bold">
//               Depósito:
//             </label>
//             <select
//               name="deposito"
//               id="deposito"
//               className="rounded-md p-1 border-2 border-gray-300"
//               onChange={(e) =>
//                 setDepositoSeleccionado(
//                   depositos.find(
//                     (deposito) => deposito.dep_codigo === Number(e.target.value)
//                   )
//                 )
//               }
//               value={depositoSeleccionado?.dep_descripcion}
//             >
//               {depositos.map((deposito) => (
//                 <option key={deposito.dep_codigo} value={deposito.dep_codigo}>
//                   {deposito.dep_descripcion}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <div className="flex flex-col gap-2">
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="cliente" className="text-sm font-bold">
//               Cliente:
//             </label>
//             <input
//               type="number"
//               name="busquedaCliente"
//               id="busquedaCliente"
//               ref={clienteRef}
//               className="rounded-md p-1 border-2 border-gray-300 w-1/4 focus:outline-none"
//               value={busquedaCliente}
//               onChange={(e) => setBusquedaCliente(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && busquedaCliente) {
//                   cargarClientesPorId(Number(busquedaCliente));
//                 }
//               }}
//             />
//             <input
//               type="text"
//               value={
//                 clienteSeleccionado
//                   ? clienteSeleccionado.cli_razon
//                   : "No se ha seleccionado ningun cliente"
//               }
//               className="rounded-md p-1 border-2 border-gray-300 w-full focus:outline-none"
//               readOnly
//             />
//           </div>
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="vendedor" className="text-sm font-bold">
//               Vendedor:
//             </label>
//             <input
//               type="number"
//               name="busquedaVendedor"
//               id="busquedaVendedor"
//               ref={vendedorRef}
//               className="rounded-md p-1 border-2 border-gray-300 w-1/4 focus:outline-none"
//               value={busquedaVendedor}
//               onChange={(e) => setBusquedaVendedor(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && busquedaVendedor) {
//                   getOperadorPorCodInterno(Number(busquedaVendedor));
//                 }
//               }}
//             />
//             <input
//               type="text"
//               value={
//                 vendedorSeleccionado
//                   ? vendedorSeleccionado.op_nombre
//                   : "No se ha seleccionado ningun vendedor"
//               }
//               className="rounded-md p-1 border-2 border-gray-300 w-full focus:outline-none"
//               readOnly
//             />
//           </div>
//         </div>
//         <div className="flex flex-col gap-2">
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="listaPrecio" className="text-sm font-bold">
//               Lista de Precios:
//             </label>
//             <select
//               name="listaPrecio"
//               id="listaPrecio"
//               className="rounded-md p-1 border-2 border-gray-300"
//               value={precioSeleccionado?.lp_descripcion}
//               onChange={(e) =>
//                 setPrecioSeleccionado(
//                   listaPrecios.find(
//                     (listaPrecio) =>
//                       listaPrecio.lp_codigo === Number(e.target.value)
//                   )
//                 )
//               }
//             >
//               {listaPrecios.map((listaPrecio) => (
//                 <option
//                   key={listaPrecio.lp_codigo}
//                   value={listaPrecio.lp_codigo}
//                 >
//                   {listaPrecio.lp_descripcion}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="moneda" className="text-sm font-bold">
//               Moneda:
//             </label>
//             <select
//               name="moneda"
//               id="moneda"
//               className="rounded-md p-1 border-2 border-gray-300"
//               value={monedaSeleccionada?.mo_descripcion}
//               onChange={(e) =>
//                 setMonedaSeleccionada(
//                   monedas.find(
//                     (moneda) => moneda.mo_codigo === Number(e.target.value)
//                   )
//                 )
//               }
//             >
//               {monedas.map((moneda) => (
//                 <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
//                   {moneda.mo_descripcion}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <div className="flex flex-col gap-2">
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="entrega" className="text-sm font-bold">
//               Entrega:
//             </label>
//             <input
//               type="number"
//               name="entrega"
//               id="entrega"
//               className="rounded-md p-1 border-2 border-gray-300"
//               value={pedidoDTO.p_entrega}
//               onChange={(e) =>
//                 setPedidoDTO({
//                   ...pedidoDTO,
//                   p_entrega: Number(e.target.value),
//                 })
//               }
//             />
//           </div>
//           <div className="flex flex-row gap-2 items-center">
//             <label htmlFor="cantCuotas" className="text-sm font-bold">
//               Cant. Cuotas:
//             </label>
//             <input
//               type="number"
//               name="cantCuotas"
//               id="cantCuotas"
//               className="rounded-md p-1 border-2 border-gray-300"
//               value={pedidoDTO.p_cantcuotas}
//               onChange={(e) =>
//                 setPedidoDTO({
//                   ...pedidoDTO,
//                   p_cantcuotas: Number(e.target.value),
//                 })
//               }
//             />
//           </div>
//         </div>
//         <div className="flex flex-col gap-2">
//           <div className="flex flex-col  items-center bg-orange-300 border border-orange-500 rounded-md p-2">
//             <label htmlFor="condicion" className="text-sm font-bold">
//               Condición:
//             </label>
//             <div className="flex flex-row gap-2">
//               <input type="checkbox" name="contado_input" id="contado_input" />
//               <label htmlFor="contado_input">Contado</label>
//             </div>
//             <div className="flex flex-row gap-2 justify-start">
//               <input type="checkbox" name="credito_input" id="credito_input" />
//               <label htmlFor="credito_input">Crédito</label>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2">
//           <div className="flex flex-row gap-2">
//             <input type="radio" name="tipo_pedido" id="tipo_pedido" />
//             <label htmlFor="tipo_pedido" className="font-bold text-red-500">
//               Show Room
//             </label>
//           </div>
//           <div className="flex flex-row gap-2">
//             <input type="radio" name="tipo_pedido" id="tipo_pedido" />
//             <label htmlFor="tipo_pedido" className="font-bold text-green-700">
//               Encomienda
//             </label>
//           </div>
//           <div className="flex flex-row gap-2">
//             <input type="radio" name="tipo_pedido" id="tipo_pedido" />
//             <label htmlFor="tipo_pedido" className="font-bold text-blue-700">
//               N. Regional
//             </label>
//           </div>
//         </div>
//         <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2">
//           <div className="flex flex-row gap-2">
//             <input type="radio" name="tipo_pedido" id="tipo_pedido" />
//             <label htmlFor="tipo_pedido" className="font-bold ">
//               Vendedor
//             </label>
//           </div>
//           <div className="flex flex-row gap-2">
//             <input type="radio" name="tipo_pedido" id="tipo_pedido" />
//             <label htmlFor="tipo_pedido" className="font-bold">
//               Telefono
//             </label>
//           </div>
//           <div className="flex flex-row gap-2">
//             <input type="radio" name="tipo_pedido" id="tipo_pedido" />
//             <label htmlFor="tipo_pedido" className="font-bold">
//               Facebook
//             </label>
//           </div>
//         </div>
//         <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2 flex-1 bg-white">
//           <label htmlFor="observaciones" className="text-sm font-bold">
//             Observaciones:
//           </label>
//           <textarea name="observaciones" id="observaciones"></textarea>
//         </div>
//       </div>
//       <div className="flex flex-row gap-2 bg-gray-300 p-2 rounded-md">
//         <input
//           type="text"
//           className="rounded-md p-1 border-2 border-gray-300"
//           ref={articuloCodigoRef}
//           placeholder="Codigo de barras:"
//         />
//         <input
//           type="text"
//           className="rounded-md p-1 border-2 border-gray-300 w-full"
//           readOnly
//           placeholder="Descripcion del articulo:"
//         />
//         <input
//           type="number"
//           id="cantidad"
//           className="rounded-md p-1 border-2 border-gray-300 w-[72px]"
//           placeholder="Cdad:"
//         />
//         <input
//           type="number"
//           id="bonificacion"
//           name="bonificacion"
//           className="rounded-md p-1 border-2 border-gray-300 w-[72px]"
//           placeholder="V/B:"
//         />
//         <input
//           type="number"
//           name="precio_unitario"
//           id="precio_unitario"
//           className="rounded-md p-1 border-2 border-gray-300 w-1/12"
//           placeholder="P.Unit:"
//         />
//         <input
//           type="number"
//           name="lote"
//           id="lote"
//           className="rounded-md p-1 border-2 border-gray-300 w-1/12"
//           placeholder="Descuento:"
//         />
//         <input
//           type="text"
//           name="exentas"
//           className="rounded-md p-1 border-2 border-gray-300 w-1/12"
//           readOnly
//           placeholder="Lote:"
//         />
//         <input
//           type="number"
//           name="exentas"
//           className="rounded-md p-1 border-2 border-gray-300 w-1/12"
//           readOnly
//           placeholder="Exentas:"
//         />
//         <input
//           type="number"
//           name="impuesto5"
//           className="rounded-md p-1 border-2 border-gray-300 w-1/12"
//           readOnly
//           placeholder="5%:"
//         />
//         <input
//           type="number"
//           name="impuesto10"
//           className="rounded-md p-1 border-2 border-gray-300 w-1/12"
//           readOnly
//           placeholder="10%:"
//         />
//       </div>
//       <div className="flex flex-row gap-2 bg-slate-300 p-2 rounded-md">
//         <table className="w-full">
//           <thead className="bg-blue-500 text-white rounded-md">
//             <tr className="text-md font-bold text-left [&>th]:p-2 [&>th]:border-2 [&>th]:border-white">
//               <th>Código</th>
//               <th>Descripción</th>
//               <th>Cantidad</th>
//               <th>Bonif.</th>
//               <th>Precio Unit.</th>
//               <th>Descuento</th>
//               <th>Exentas</th>
//               <th>5%</th>
//               <th>10%</th>
//             </tr>
//           </thead>
//           <tbody>
//             {detallePedido.length > 0 ? (
//               detallePedido.map((detalle) => {
//                 return (
//                   <tr>
//                     <td>{detalle.codigo}</td>
//                     <td>{detalle.descripcion}</td>
//                     <td>{detalle.dp_cantidad}</td>
//                     <td>{detalle.dp_bonif === 1 ? "B" : "V"}</td>
//                     <td>{detalle.dp_precio}</td>
//                     <td>{detalle.dp_descuento}</td>
//                     <td>{detalle.dp_exentas}</td>
//                     <td>{detalle.dp_cinco}</td>
//                     <td>{detalle.dp_diez}</td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan={9}  className="text-center font-bold h-full">
//                   No hay articulos en el pedido
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       <div className="flex flex-row gap-2 p-2 bg-blue-300 rounded-md ">
//         <div className="flex flex-row gap-2">
          
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FormularioPedidos;
