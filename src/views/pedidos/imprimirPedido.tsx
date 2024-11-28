import  { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Flex,
  Spinner,
} from '@chakra-ui/react'
import styled from '@emotion/styled'
import { usePDF } from 'react-to-pdf'
import { api_url } from '@/utils'

const ReceiptWrapper = styled.pre`
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.2;
  white-space: pre-wrap;
  width: 100%;
`

const ReceiptTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const ReceiptRow = styled.tr`
  &:nth-of-type(even) {
    background-color: #f9f9f9;
  }
`

const ReceiptCell = styled.td`
  padding: 4px;
  text-align: left;
  &.right {
    text-align: right;
  }
`

const ReceiptHeader = styled.th`
  padding: 4px;
  text-align: left;
  font-weight: bold;
  &.right {
    text-align: right;
  }
`

const ReceiptDivider = styled.hr`
  border: none;
  border-top: 1px dotted #000;
  margin: 8px 0;
`

interface PedidoModalProps {
  isOpen: boolean
  onClose: () => void
  pedidoID: number | null
}

interface Pedido {
  p_codigo: number
  p_cliente: number
  p_operador: number
  p_moneda: number
  p_fecha: string
  p_descuento: string
  p_estado: number
  p_vendedor: number
  p_credito: number
  p_obs: string
  p_deposito: number
  p_total?: number 
  p_acuerdo: number
  p_area: number
  p_autorizar_a_contado: number
  p_cantcuotas: number
  p_consignacion: number
  p_entrega: string
  p_imprimir: number
  p_interno: string
  p_latitud: number | null
  p_longitud: number | null
  p_nropedido: string
  p_tipo: number
  p_tipo_estado: number
  p_zona: number
  p_sucursal: number
}

interface DetallePedido {
    altura: number
    art_codigo: number
    cantidad: number
    cinco: number
    codbarra: string
    codlote: number
    depre_obs: string
    descripcion: string
    descuento: number
    det_codigo: number
    diez: number
    exentas: number
    iva: number
    precio: number
}

interface Cliente {
  cli_codigo: number
  cli_razon: string
  cli_ruc: string
  cli_tel: string
}

interface Sucursal {
  id: number
  descripcion: string
  ciudad: string
  tel: string
  nombre_emp: string
}

interface Deposito {
  dep_codigo: number
  dep_descripcion: string
}

interface Vendedor {
  id: number
  op_nombre: string
  op_codigo: string
}

export default function PedidoModal({ isOpen, onClose, pedidoID }: PedidoModalProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [detallePedido, setDetallePedido] = useState<DetallePedido[]>([])
  const [clienteInfo, setClienteInfo] = useState<Cliente | null>(null)
  const [sucursalInfo, setSucursalInfo] = useState<Sucursal | null>(null)
  const [depositoInfo, setDepositoInfo] = useState<Deposito | null>(null)
  const [vendedorInfo, setVendedorInfo] = useState<Vendedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { toPDF, targetRef } = usePDF({ filename: `pedido-${pedidoID}.pdf` })

  useEffect(() => {
    if (isOpen && pedidoID) {
      fetchPedidosData()
    }
  }, [isOpen, pedidoID])

  const fetchPedidosData = async () => {
    if (!pedidoID) {
      console.error("Pedido ID no proporcionado")
      return
    }
  
    setIsLoading(true)
    try {
      const [pedidoResponse, detalleResponse] = await Promise.all([
        axios.get(`${api_url}pedidos/?cod=${pedidoID}`),
        axios.get(`${api_url}pedidos/detalles?cod=${pedidoID}`)
      ])


  
      const [pedidoData] = pedidoResponse.data.body
      const detalles = detalleResponse.data.body

      setPedido(pedidoData)
      setDetallePedido(detalles)

      console.log(pedidoData)
  
      await Promise.all([
        fetchClienteInfo(pedido?.p_cliente ?? 0),
        fetchSucursalInfo(),
        fetchDepositoInfo(),
        fetchVendedorInfo(pedido?.p_vendedor ?? 0)
      ])
    } catch (error) {
      console.error("Error fetching presupuesto data", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchClienteInfo = async (clienteId: number) => {
    try {
      const response = await axios.get(`${api_url}clientes/${clienteId}`)
      const clienteData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null
      setClienteInfo(clienteData)
    } catch (error) {
      console.error("Error fetching cliente info", error)
    }
  }
  
  const fetchSucursalInfo = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`)
      const sucursalData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null
      setSucursalInfo(sucursalData)
    } catch (error) {
      console.error("Error fetching sucursal info", error)
    }
  }

  const fetchDepositoInfo = async () => {
    try {
      const response = await axios.get(`${api_url}depositos`)
      const depositoData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null
      setDepositoInfo(depositoData)
    } catch (error) {
      console.error("Error fetching deposito info", error)
    }
  }

  const fetchVendedorInfo = async (vendedorId: number) => {
    try {
      const response = await axios.get(`${api_url}usuarios/${vendedorId}`)
      const vendedorData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null
      setVendedorInfo(vendedorData)
    } catch (error) {
      console.error("Error fetching vendedor info", error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-PY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: pedido?.p_moneda === 1 ? 'PYG' : 'USD',
      minimumFractionDigits: pedido?.p_moneda === 1 ? 0 : 2,
      maximumFractionDigits: pedido?.p_moneda === 1 ? 0 : 2,
    }).format(amount)
  }


  const safeString = (value: any): string => {
    return typeof value === 'string' ? value : String(value || '')
  }

  if (isLoading || !pedido || !clienteInfo || !sucursalInfo || !vendedorInfo) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cargando detalles del Pedido</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justify="center" align="center" height="200px">
              <Spinner size="xl" />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }


  const total = detallePedido.reduce((sum, detalle) => {
    if (!detalle || isNaN(detalle.cantidad) || isNaN(detalle.precio) || isNaN(detalle.descuento)) {
      return sum;
    }
    const cantidad = Number(detalle.cantidad) || 0;
    const precio = Number(detalle.precio) || 0;
    return sum + (cantidad * precio );
  }, 0);
  
  const totalDescuentos = detallePedido.reduce((sum, detalle) => {
    if (!detalle || isNaN(detalle.descuento)) {
      return sum;
    }
    const descuento = Number(detalle.descuento* detalle.cantidad) || 0;
    return sum + descuento;
  }, 0);
  
  const totalFinal = total - totalDescuentos;




  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth="1200px">
        <ModalBody p={8} ref={targetRef}>
          <ReceiptWrapper>
            <Box textAlign="center" mb={2}>
              <Text fontWeight="bold">{safeString(sucursalInfo.nombre_emp)}</Text>
              <Text>Filial: {safeString(sucursalInfo.descripcion)}</Text>
              <Text>Ciudad: Ciudad del Este</Text>
              <Text>Telef.: {safeString(sucursalInfo.tel)}</Text>
            </Box>
            <ReceiptDivider />
            <ReceiptTable>
              <tbody>
                <ReceiptRow>
                  <ReceiptCell className="right">Pedido Nro. {pedidoID}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Fecha..: {`${formatDate(pedido.p_fecha)}`}</ReceiptCell>
                  <ReceiptCell className="right">Sucursal.: {safeString(sucursalInfo.descripcion)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Moneda.: {pedido.p_moneda === 1 ? 'GUARANI' : 'USD'}</ReceiptCell>
                  <ReceiptCell className="right">Depósito.: {safeString(depositoInfo?.dep_descripcion)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Cliente: {safeString(clienteInfo.cli_razon)}</ReceiptCell>
                  <ReceiptCell className="right">Operacion.: {safeString(pedidoID)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>RUC: {safeString(clienteInfo.cli_ruc)}</ReceiptCell>
                  <ReceiptCell className="right">Vendedor.: {safeString(vendedorInfo.op_nombre)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Teléfono.: {safeString(clienteInfo.cli_tel)}</ReceiptCell>
                  <ReceiptCell className="right">Ciudad..: Ciudad del Este</ReceiptCell>
                </ReceiptRow>
              </tbody>
            </ReceiptTable>
            <ReceiptDivider />
            <ReceiptTable>
              <thead>
                <ReceiptRow>
                  <ReceiptHeader>Cód</ReceiptHeader>
                  <ReceiptHeader>Descripción</ReceiptHeader>
                  <ReceiptHeader className="right">Cant</ReceiptHeader>
                  <ReceiptHeader className="right">Precio U.</ReceiptHeader>
                  <ReceiptHeader className="right">Desc. U.</ReceiptHeader>
                  <ReceiptHeader className="right">Valor</ReceiptHeader>
                </ReceiptRow>
              </thead>
              <tbody>
                {detallePedido.map((detalle, index) => (
                  <ReceiptRow key={index}>
                    <ReceiptCell>{safeString(detalle.art_codigo)}</ReceiptCell>
                    <ReceiptCell>{safeString(detalle.descripcion)}</ReceiptCell>
                    <ReceiptCell className="right">{safeString(detalle.cantidad)}</ReceiptCell>
                    <ReceiptCell className="right">{formatCurrency(detalle.precio)}</ReceiptCell>
                    <ReceiptCell className="right">{formatCurrency(detalle.descuento)}</ReceiptCell>
                    <ReceiptCell className="right">{formatCurrency(detalle.cantidad *( detalle.precio - detalle.descuento))}</ReceiptCell>
                  </ReceiptRow>
                ))}
              </tbody>
            </ReceiptTable>
            <ReceiptDivider />
            <ReceiptTable>
              <tbody>
                <ReceiptRow>
                  <ReceiptCell>Total Items: {detallePedido.length}</ReceiptCell>
                  <ReceiptCell className="right">Total s/Desc.: {formatCurrency(total)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Condicion de pago.: {pedido.p_credito=== 0 ? 'Contado' : 'Credito'}</ReceiptCell>
                  <ReceiptCell className="right">Descuento Total: {formatCurrency(totalDescuentos)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell></ReceiptCell>
                  <ReceiptCell className="right">Total: {formatCurrency(totalFinal)}</ReceiptCell>
                </ReceiptRow>
              </tbody>
            </ReceiptTable>
            <ReceiptDivider />
            <Text>{'<<Gracias por su preferencia>>'}</Text>
            <Box mt={4}>
              <Text>Firma: _________________</Text>
            </Box>
          </ReceiptWrapper>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Cerrar
          </Button>
          <Button colorScheme="green" mr={3} onClick={() => toPDF()}>
            Descargar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}