import React, { useState, useEffect, useRef } from 'react'
import { 
  Flex, Box, VStack, Heading, useMediaQuery, useToast, FormLabel, 
  Select, Input, Table, Thead, Tbody, Tr, Th, Td, Radio, RadioGroup,
  Stack, Spinner, Text
} from '@chakra-ui/react'
import { Archive } from 'lucide-react'
import { useAuth } from '@/services/AuthContext' 
import { api_url } from '@/utils'
import axios from 'axios'

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

interface Marca {
  ma_codigo: number
  ma_descripcion: string
}

interface Subcategoria {
  sc_codigo: number
  sc_descripcion: string
}

interface FiltrosArticulos {
  busqueda?: string
  deposito?: number
  marca?: number
  subcategoria?: number
}

const GestionInventario: React.FC = () => {
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [depositoId, setDepositoId] = useState<string>('')
  const [filtroStock, setFiltroStock] = useState('todos')  // Por defecto buscará todos los articulos
  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [moneda, ] = useState('PYG')
  const toast = useToast()
  const { auth } = useAuth()
  const [isMobile] = useMediaQuery('(max-width: 48em)')
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [filtros, setFiltros] = useState<FiltrosArticulos>({})
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  const fetchArticulos = async (pagina: number) => {
    if (!depositoId || !hasMore) return

    try {
      setIsLoading(true)
      setArticulos([])
      
      const params = {
        pagina,
        limite: 20,
        buscar: articuloBusqueda || undefined,
        id_deposito: depositoId ? parseInt(depositoId) : undefined,
        stock: filtroStock === 'todos' ? undefined : parseInt(filtroStock),
        marca: filtros.marca ? parseInt(String(filtros.marca)) : undefined,
        subcategoria: filtros.subcategoria ? parseInt(String(filtros.subcategoria)) : undefined
      }

      console.log(params);

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
      )

      const response = await axios.get(`${api_url}articulos/traer-todos-los-articulos`, {
        params: cleanParams
      })

      console.log(response.data);

      const nuevosArticulos = response.data
      
      if (pagina === 1) {
        setArticulos(nuevosArticulos)
      } else {
        setArticulos(prev => [...prev, ...nuevosArticulos])
      }

      setHasMore(nuevosArticulos.length === 50)
      setIsError(false)
    } catch (error) {
      setIsError(true)
      toast({
        title: "Error",
        description: "Error al cargar los artículos",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setPagina(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [isLoading, hasMore])

  // Efecto para cargar artículos cuando cambian los filtros
  useEffect(() => {
    setPagina(1)
    setHasMore(true)
    fetchArticulos(1)

  }, [depositoId, articuloBusqueda, filtroStock, filtros])

  // Efecto para cargar más artículos cuando cambia la página
  useEffect(() => {
    if (pagina > 1) {
      fetchArticulos(pagina)
    }
  }, [pagina])

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
    const fetchMarcasYSubcategorias = async () => {
      try {
        const [marcasRes, subcatRes] = await Promise.all([
          axios.get(`${api_url}marcas/`),
          axios.get(`${api_url}subcategorias/`)
        ])
        setMarcas(marcasRes.data.body)
        setSubcategorias(subcatRes.data.body)
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar marcas y subcategorías",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    }

    fetchMarcasYSubcategorias()
  }, [])

  const handleFiltroChange = (tipo: keyof FiltrosArticulos, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: valor || undefined
    }))
  }

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArticuloBusqueda(e.target.value)
  }

  const handleDepositoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepositoId(e.target.value)
  }

  const handleStockRadioChange = (value: string) => {
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
    <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
      <VStack spacing={4} align="stretch" bg={'white'} p={2} borderRadius={'md'} boxShadow={'sm'} h={'100%'}>
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
          <Box width="100%">
            <FormLabel>Marca</FormLabel>
            <Select 
              placeholder="Seleccionar marca"
              onChange={(e) => handleFiltroChange('marca', e.target.value)}
            >
              {marcas.map((marca) => (
                <option key={marca.ma_codigo} value={marca.ma_codigo}>
                  {marca.ma_descripcion}
                </option>
              ))}
            </Select>
          </Box>

          <Box width="100%">
            <FormLabel>Subcategoría</FormLabel>
            <Select 
              placeholder="Seleccionar subcategoría"
              onChange={(e) => handleFiltroChange('subcategoria', e.target.value)}
            >
              {subcategorias.map((subcat) => (
                <option key={subcat.sc_codigo} value={subcat.sc_codigo}>
                  {subcat.sc_descripcion}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        {isLoading ? (
          <Flex justify="center" p={4}>
            <Spinner />
          </Flex>
        ) : isError ? (
          <Box p={4} textAlign="center" color="red.500">
            <Text>Error al cargar los artículos</Text>
          </Box>
        ) : !articulos.length ? (
          <Box p={4} textAlign="center" color="gray.500">
            No se encontraron artículos
          </Box>
        ) : (
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
                    <Td>{articulo.al_vencimiento?.substring(0, 10) || '-'}</Td>
                    <Td textAlign="right">{formatCurrency(articulo.ar_pcg)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <div ref={observerTarget} style={{ height: '20px' }}>
              {isLoading && <Spinner />}
            </div>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default GestionInventario