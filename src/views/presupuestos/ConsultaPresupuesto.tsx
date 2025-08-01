import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Box, 
  VStack, 
  Heading,  
  Input, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Tabs,
  TabList,
  Tab,
  HStack,
  InputGroup,
  InputLeftElement,
  Collapse,
  Button,
  Flex,
  useMediaQuery
} from '@chakra-ui/react'
import { format, subDays, startOfWeek, startOfMonth} from 'date-fns'
import { api_url } from '@/utils'
import { SearchIcon } from '@chakra-ui/icons'
import { FilePen, Printer, ShoppingCart } from 'lucide-react'
import PresupuestoModal from './imprimirPresupuesto'
import PresupuestoModalEstilizado from './imprimirPresupuestoEstilizado'
import MenuContextual from '../../shared/modules/MenuContextual'
import { useSwitch } from '@/shared/services/SwitchContext'
import { PresupuestoViewModel } from '@/models/viewmodels/Presupuestos/PResupuestoVIewModel'
import { ClienteViewModel } from '@/models/viewmodels/ClienteViewModel'



interface DetallePresupuesto {
  det_codigo: number
  art_codigo: number
  codbarra: string
  descripcion: string
  descripcion_editada: string
  cantidad: number
  precio: number
  descuento: number
  exentas: number
  cinco: number
  diez: number
  lote: string
  vence: string
  ar_editar_desc: number
}


const periodos = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Ayer', value: 'ayer' },
  { label: 'Últimos 3 Días', value: 'tresDias' },
  { label: 'Esta Semana', value: 'semana' },
  { label: 'Este Mes', value: 'mes' },
]

interface ConsultaPresupuestosProps {
  onSelectPresupuesto?: (presupuesto: PresupuestoViewModel, detalles: DetallePresupuesto[]) => void
  onClose?: () => void
  isModal?: boolean
  clienteSeleccionado?: ClienteViewModel | null
}

export default function ConsultaPresupuestos({ onSelectPresupuesto, onClose, isModal= false, clienteSeleccionado }: ConsultaPresupuestosProps) {
  const [presupuestos, setPresupuestos] = useState<PresupuestoViewModel[]>([])
  const [fechaDesde, setFechaDesde] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [fechaHasta, setFechaHasta] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(0)
  const [vendedorFiltro, setVendedorFiltro] = useState('')
  const [clienteFiltro, setClienteFiltro] = useState('')
  const [facturaFiltro] = useState('')
  const [idFiltro, setIdFiltro] = useState('')
  const [detallePresupuesto, setDetallePresupuesto] = useState<DetallePresupuesto[]>([])
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<number | null>(null)
  const [, setIsLoading] = useState(false)
  const toast = useToast()
  const [isMobile] = useMediaQuery('(max-width: 48em)')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [presupuestoID, setPresupuestoID] = useState<number | null>(null)
  const {isSwitchOn} = useSwitch()

  useEffect(() => {
    fetchPresupuestos()
  }, [fechaDesde, fechaHasta])

  const fetchPresupuestos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${api_url}presupuestos/consultas`, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        sucursal: '',
        cliente: clienteSeleccionado ? clienteSeleccionado.cli_codigo : clienteFiltro, // Usar clienteSeleccionado si está disponible
        vendedor: vendedorFiltro,
        articulo: '',
        moneda: '',
        factura: facturaFiltro
      });
      setPresupuestos(response.data.body);
      console.log(response.data.body)
    } catch (error) {
      toast({
        title: "Error al cargar los presupuestos",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetallePresupuesto = async (codigo: number) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${api_url}presupuestos/detalles?cod=${codigo}`)
      setDetallePresupuesto(response.data.body)
      setPresupuestoID(codigo)
      console.log(response.data.body)
    } catch (error) {
      toast({
        title: "Error al cargar el detalle del presupuesto",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePeriodoChange = (index: number) => {
    setPeriodoSeleccionado(index)
    const hoy = new Date()
    let nuevaFechaDesde = hoy

    switch (periodos[index].value) {
      case 'hoy':
        nuevaFechaDesde = hoy
        break
      case 'ayer':
        nuevaFechaDesde = subDays(hoy, 1)
        break
      case 'tresDias':
        nuevaFechaDesde = subDays(hoy, 2)
        break
      case 'semana':
        nuevaFechaDesde = startOfWeek(hoy)
        break
      case 'mes':
        nuevaFechaDesde = startOfMonth(hoy)
        break
    }

    setFechaDesde(format(nuevaFechaDesde, 'yyyy-MM-dd'))
    setFechaHasta(format(hoy, 'yyyy-MM-dd'))
  }

  const formatNumber = (value: number) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      return numericValue.toLocaleString('es-ES', { minimumFractionDigits: 0 });
    }
    return value;
  }

  const formatCantidad = (cantidad: string | number) => {
    const numericValue = Number(cantidad);
    if (!isNaN(numericValue)) {
      return Math.floor(numericValue).toString(); // Removes decimals
    }
    return cantidad;
  }

  const filteredPresupuesto = presupuestos.filter(presupuesto => 
    presupuesto.vendedor.toLowerCase().includes(vendedorFiltro.toLowerCase()) &&
    presupuesto.cliente.toLowerCase().includes(clienteFiltro.toLowerCase()) &&
    presupuesto.factura.toLowerCase().includes(facturaFiltro.toLowerCase()) &&
    presupuesto.codigo.toString().includes(idFiltro)
  )

  const handleVentaClick = (codigo: number) => {
    if (presupuestoSeleccionado === codigo) {
      setPresupuestoSeleccionado(null)
      setDetallePresupuesto([])
      setPresupuestoID(codigo)
    } else {
      setPresupuestoSeleccionado(codigo)
      fetchDetallePresupuesto(codigo)
    }
  }

  const handleModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSelectPresupuesto = (presupuesto: PresupuestoViewModel) => {
    if (onSelectPresupuesto) {
      onSelectPresupuesto(presupuesto, detallePresupuesto);
    }
    if (onClose) {
      onClose();
    }
  }

  return (
    <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
      <VStack spacing={4} align="stretch" bg={'white'} p={2} borderRadius={'md'} boxShadow={'sm'} h={'100%'}>
        <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile ? 4 : 6} alignItems="center" rounded="lg">
          <FilePen size={32} className='mr-2' />
          <Heading size={isMobile ? 'sm' : 'md'}>Consulta de Presupuestos</Heading>
          <MenuContextual/>
        </Flex>
        
        <HStack spacing={4}>
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </HStack>

        <Flex flexDir={isMobile? 'column' : 'row'} gap={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filtrar por vendedor"
              value={vendedorFiltro}
              onChange={(e) => setVendedorFiltro(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filtrar por cliente"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nº de presupuesto"
              value={idFiltro}
              onChange={(e) => setIdFiltro(e.target.value)}
            />
          </InputGroup>
        </Flex>
        <Tabs index={periodoSeleccionado} onChange={handlePeriodoChange} variant={'solid-rounded'} colorScheme='green'>
          <TabList>
            {periodos.map((periodo, index) => (
              <Tab key={index}>{periodo.label}</Tab>
            ))}
          </TabList>
        </Tabs>

        <Box height={'600px'} overflowY={'auto'} maxWidth={'90vw'} overflowX={'auto'}>
          <Table variant="simple">
            <Thead bg={'blue.100'}>
              <Tr>
                <Th>Codigo</Th>
                <Th>Moneda</Th>
                <Th>Cliente</Th>
                <Th>Fecha</Th>
                <Th textAlign="right">Descuento</Th>
                <Th textAlign="right">Total</Th>
                <Th>Operador</Th>
                <Th>Vendedor</Th>
                <Th></Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPresupuesto.map((presupuesto) => (
                <React.Fragment key={presupuesto.codigo}>
                  <Tr bg={presupuesto.estado_desc === 'Confirmado' ? 'red.100' : 'white'}>
                    <Td>{presupuesto.codigo}</Td>
                    <Td>{presupuesto.moneda}</Td>
                    <Td>{presupuesto.cliente}</Td>
                    <Td>{format(new Date(presupuesto.fecha.split(' : ')[0]), 'dd/MM/yyyy')}</Td>
                    <Td textAlign="right">{formatNumber(presupuesto.descuento)}</Td>
                    <Td textAlign="right">{(presupuesto.total)}</Td>
                    <Td>{presupuesto.vendedor}</Td>
                    <Td>{presupuesto.operador}</Td>
                    <Td>
                      <Button
                        size="md"
                        onClick={() => handleVentaClick(presupuesto.codigo)}
                        colorScheme={presupuestoSeleccionado === presupuesto.codigo ? 'yellow' : 'green'}
                      >
                        {presupuestoSeleccionado === presupuesto.codigo ? '-' : '+'}
                      </Button>
                    </Td>
                    <Td>
                      {isModal &&(
                        <Button
                        size="md"
                        onClick={() => handleSelectPresupuesto(presupuesto)}
                        colorScheme="blue"
                        leftIcon={<ShoppingCart size={16} />}
                      >
                        Convertir a Venta
                      </Button>
                      )}
                    </Td>
                  </Tr>
                  <Tr style={{ padding: 0, margin: 0, height: '0px' }}>
                    <Td colSpan={12} style={{ padding: 0, margin: 0 }}>
                      <Collapse in={presupuestoSeleccionado === presupuesto.codigo}>
                        <Box p={4} bg="gray.100" rounded="md">
                          <Heading size="sm" mb={2}>Detalle del Presupuesto</Heading>
                          <Table size="sm" variant="striped" py={4}>
                            <Thead bg={'blue.200'}>
                              <Tr>
                                <Th>Código</Th>
                                <Th>Descripción</Th>
                                <Th>Cantidad</Th>
                                <Th textAlign="right">Precio</Th>
                                <Th textAlign="right">Descuento</Th>
                                <Th textAlign="right">Exentas</Th>
                                <Th textAlign="right">5%</Th>
                                <Th textAlign="right">10%</Th>
                                <Th textAlign="right">Lote</Th>
                                <Th textAlign="right">Vencimiento</Th>
                                <Th textAlign="right">Subtotal</Th>
                              </Tr>
                            </Thead>
                            <Tbody bg={'white'}>
                              {detallePresupuesto.map((detalle) => (
                                <Tr key={detalle.det_codigo}>
                                  <Td>{detalle.art_codigo}</Td>
                                  <Td>{detalle.descripcion_editada === ''? detalle.descripcion : detalle.descripcion_editada}</Td>
                                  <Td>{formatCantidad(detalle.cantidad)}</Td>
                                  <Td textAlign="right">{formatNumber(detalle.precio)}</Td>
                                  <Td  textAlign="right">{formatNumber(detalle.descuento)}</Td>
                                  <Td textAlign={'right'}>{formatNumber(detalle.exentas)}</Td>
                                  <Td textAlign={'right'}>{formatNumber(detalle.cinco)}</Td>
                                  <Td textAlign={'right'}>{formatNumber(detalle.diez)}</Td>
                                  <Td textAlign={'right'}>{detalle.lote}</Td>
                                  <Td textAlign={'right'}>{detalle.vence}</Td>
                                  <Td textAlign="right">{formatNumber((detalle.precio - detalle.descuento) * detalle.cantidad )}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                          <Flex flexDirection={'row'} justify={'end'} gap={4} width={'full'} my={4}>
                            <Button colorScheme='blue' onClick={handleModal}><Printer/></Button>
                          </Flex>
                        </Box>
                      </Collapse>
                    </Td>
                  </Tr>
                </React.Fragment>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
      {isSwitchOn ? (
        <PresupuestoModalEstilizado
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          presupuestoID={presupuestoID}
        />
      ) : (
        <PresupuestoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          presupuestoID={presupuestoID}
        />
      )}
    </Box>
  )
}