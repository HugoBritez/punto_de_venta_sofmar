import React, { useState, useEffect } from 'react'
import { 
  Flex, Box, VStack, Heading, useMediaQuery, useToast, FormLabel, 
  Select, Input, Table, Thead, Tbody, Tr, Th, Td, Radio, RadioGroup,
  Stack
} from '@chakra-ui/react'
import { Archive } from 'lucide-react'
import { useAuth } from '@/services/AuthContext' 
import { api_url } from '@/utils'
import axios from 'axios'
import { debounce } from 'lodash'

interface Articulo {
  ar_codigo: number
  ar_descripcion: string
  ar_pvg: number
  ar_pvcredito: number
  ar_pvmostrador: number
  ar_precio_4: number
  ar_codbarra: string
  ar_iva: number
  al_cantidad: number
  al_vencimiento: string
  ar_stkmin: number
  al_codigo: string
  dep_descripcion: string
  pro_razon: string
  ma_descripcion: string
  ar_pcg: number
  recargo: number
  sc_descripcion: string
  fecha_ultima_cpmra: string
  um_descripcion: number
  ub_descripcion: string
  ar_bloque: number
}

interface Deposito {
  dep_codigo: number
  dep_descripcion: string
}

const GestionInventario: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [allArticulos, setAllArticulos] = useState<Articulo[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [depositoId, setDepositoId] = useState<string>('')
  const [filtroStock, setFiltroStock] = useState('todos')  // Por defecto buscará todos los articulos
  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [moneda, ] = useState('PYG')
  const toast = useToast()
  const { auth } = useAuth()
  const [isMobile] = useMediaQuery('(max-width: 48em)')

  useEffect(() => {
    const fetchDepositos = async () => {
      if (!auth) {
        toast({
          title: "Error de autenticación",
          description: "No estás autentificado",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
        return
      }
      try {
        const response = await axios.get(`${api_url}depositos/`)
        setDepositos(response.data.body)
        if (response.data.body.length > 0) {
          const primerDeposito = response.data.body[0]
          setDepositoId(primerDeposito.dep_codigo.toString())
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Hubo un problema al traer los depósitos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }

    fetchDepositos()
  }, [auth, toast])

  useEffect(() => {
    const fetchInitialArticulos = async () => {
      if (!auth || !depositoId) return
  
      try {
        const response = await axios.get(`${api_url}articulos/`, {
          params: {
            buscar: 'a',
            id_deposito: parseInt(depositoId),
            stock: filtroStock === 'todos' ? undefined :filtroStock  // Enviamos el filtro de stock según lo que el usuario seleccione
          }
        })
        setAllArticulos([])
        setAllArticulos(response.data.body)
        setArticulos(response.data.body)
        console.log(response.data.body)
      } catch (error) {
        console.error('Error al buscar artículos iniciales:', error)
        toast({
          title: "Error",
          description: "Hubo un problema al cargar los artículos iniciales.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    }
  
    fetchInitialArticulos()
  }, [auth, depositoId, filtroStock, toast])
  

  const debouncedFetchArticulos = debounce(async (busqueda: string) => {
    if (!auth) {
      toast({
        title: "Error de autenticación",
        description: "No estás autentificado",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }
    try {
      const response = await axios.get(`${api_url}articulos/`, {
        params: {
          buscar: busqueda,
          id_deposito: parseInt(depositoId),
          stock: filtroStock === 'todos' ? undefined: filtroStock
        }
      })
      setArticulos([])
      setAllArticulos(response.data.body)
      setArticulos(response.data.body)
      console.log(response.data.body)
    } catch (error) {
      console.error('Error al buscar artículos:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al buscar los artículos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setArticulos([])
    }
  }, 1500)

  useEffect(() => {
    return () => {
      debouncedFetchArticulos.cancel()
    }
  }, [])

  const filterArticulos = (busqueda: string) => {
    const filteredArticulos = allArticulos.filter(articulo => 
      articulo.ar_descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      articulo.ar_codbarra.includes(busqueda)
    )
    setArticulos(filteredArticulos)
  }

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value
    setArticulos([])
    setAllArticulos([])
    debouncedFetchArticulos(busqueda)
    setArticuloBusqueda(busqueda)
    filterArticulos(busqueda)
  }

  const handleDepositoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepositoId(e.target.value)
  }

  const handleStockRadioChange = (value: string) => {
    setAllArticulos([])
    setArticulos([])
    setFiltroStock(value)
  }
  const formatCurrency = (amount: number) => {
    const currencySymbol: { [key: string]: string } = {
      USD: '$',
      PYG: '₲',
    }

    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: moneda === 'PYG' ? 0 : 2,
      maximumFractionDigits: moneda === 'PYG' ? 0 : 2,
    }).format(amount).replace(/\s/g, '').replace(moneda, currencySymbol[moneda])
  }

  return (
    <Box maxW='full' p={5}>
  <VStack spacing={4} align="stretch">
    <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile ? 4 : 6} alignItems="center" rounded="lg">
      <Archive size={32} className='mr-2' />
      <Heading size={isMobile ? 'sm' : 'md'}>Consulta de articulos</Heading>
    </Flex>
    <Flex flexDirection={isMobile ? 'column' : 'row'} gap={4}>
      <Box width="100%">
        <FormLabel htmlFor="busqueda">Buscar artículo</FormLabel>
        <Input 
          id="busqueda"
          placeholder="Buscar artículo" 
          value={articuloBusqueda} 
          onChange={handleBusqueda}
        />
      </Box>
      <Box width="100%">
        <FormLabel htmlFor="deposito">Depósito</FormLabel>
        <Select id="deposito" placeholder="Seleccionar depósito" value={depositoId} onChange={handleDepositoChange}>
          {depositos.map((deposito) => (
            <option key={deposito.dep_codigo} value={deposito.dep_codigo.toString()}>{deposito.dep_descripcion}</option>
          ))}
        </Select>
      </Box>
      <Box width="100%"  alignItems="flex-end">
      <FormLabel>Estado de Stock</FormLabel>
        <Box display={'flex'} flexDirection={'row'}>
        <RadioGroup onChange={handleStockRadioChange} value={filtroStock}>
          <Stack direction={'row'} spacing={4}>
          <Radio value="todos">Todos</Radio>
          <Radio value="1">Stock &gt; 0</Radio>
          <Radio value="0">Stock = 0</Radio>
          <Radio value="-1">Stock &lt; 0</Radio>
          </Stack>
        </RadioGroup>
        </Box>
  </Box>
    </Flex>
    <Box overflowX="auto" maxHeight={'750px'}>
    <Table variant="striped">
  <Thead bg={'blue.100'}>
    <Tr>
      <Th>Cod. Barra</Th>
      <Th>Código</Th>
      <Th>Descripción</Th>
      <Th>Stock</Th>
      <Th textAlign="right">Pr. Venta Contado</Th>
      <Th textAlign="right">Pr. Venta Crédito</Th>
      <Th textAlign="right">Pr. Venta Mostrador</Th>
      <Th textAlign="right">Precio Venta 4</Th>
      <Th>Proveedor</Th>
      <Th>Deposito</Th>
      <Th>Lote</Th>
      <Th>Bloque</Th>
      <Th>Ubicacion</Th>
      <Th>Presentacion</Th>
      <Th>Marca</Th>
      <Th>Categoria</Th>
      <Th>Vencimiento</Th>
      <Th textAlign="right">Costo Fob.</Th>
    </Tr>
  </Thead>
  <Tbody>
    {articulos.map((articulo) => (
      <Tr key={articulo.al_codigo}>
        <Td>{articulo.ar_codbarra}</Td>
        <Td>{articulo.ar_codigo}</Td>
        <Td>{articulo.ar_descripcion}</Td>
        <Td>{articulo.al_cantidad}</Td>
        <Td textAlign="right">{formatCurrency(articulo.ar_pvg)}</Td>
        <Td textAlign="right">{formatCurrency(articulo.ar_pvcredito)}</Td>
        <Td textAlign="right">{formatCurrency(articulo.ar_pvmostrador)}</Td>
        <Td textAlign="right">{formatCurrency(articulo.ar_precio_4)}</Td>
        <Td>{articulo.pro_razon}</Td>
        <Td>{articulo.dep_descripcion}</Td>
        <Td>{articulo.al_codigo}</Td>
        <Td>{articulo.ar_bloque}</Td>
        <Td>{articulo.ub_descripcion}</Td>
        <Td>{articulo.um_descripcion}</Td>
        <Td>{articulo.ma_descripcion}</Td>
        <Td>{articulo.sc_descripcion}</Td>
        <Td>{articulo.al_vencimiento.substring(0, 10)}</Td>
        <Td textAlign="right">{formatCurrency(articulo.ar_pcg)}</Td>
      </Tr>
    ))}
  </Tbody>
</Table>
    </Box>
  </VStack>
</Box>

  )
}

export default GestionInventario