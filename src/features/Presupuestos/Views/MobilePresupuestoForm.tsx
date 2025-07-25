import { useDepositos } from "@/shared/hooks/querys/useDepositos"
import { useListaDePrecios } from "@/shared/hooks/querys/useListaDePrecios"
import { useMonedas } from "@/shared/hooks/querys/useMonedas"
import { useSucursales } from "@/shared/hooks/querys/useSucursales"
import { useUsuarios } from "@/shared/hooks/querys/useUsuarios"
import { ClienteViewModel } from "@/shared/types/clientes"
import { DepositoViewModel } from "@/shared/types/depositos"
import { ListaPrecio } from "@/shared/types/listaPrecio"
import { Moneda } from "@/shared/types/moneda"
import { UsuarioViewModel } from "@/shared/types/operador"
import { SucursalViewModel } from "@/shared/types/sucursal"
import { useState } from "react"

interface MobilePresupuestoFormProps {
    cliente?: ClienteViewModel
    operador?: UsuarioViewModel
}

export const MobilePresupuestoForm = () => {
    const { data: sucursales } = useSucursales();
    const { data: depositos } = useDepositos();
    const { data: monedas } = useMonedas();
    const { data: listaPrecios } = useListaDePrecios();
    const { data: usuarios } = useUsuarios();


    const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<SucursalViewModel | null>(null);
    const [depositoSeleccionado, setDepositoSeleccionado] = useState<DepositoViewModel | null>(null);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteViewModel | null>(null);
    const [operadorSeleccionado, setOperadorSeleccionado] = useState<UsuarioViewModel | null>(null);
    const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(null);
    const [listaPrecioSeleccionada, setListaPrecioSeleccionada] = useState<ListaPrecio | null>(null);
    const [vendedorSeleccionado, setVendedorSeleccionado] = useState<UsuarioViewModel | null>(null);
}