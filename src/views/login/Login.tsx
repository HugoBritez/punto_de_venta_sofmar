import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  FormControl, 
  Input,  
  Heading, 
  Text, 
  InputGroup, 
  InputLeftElement,
  InputRightElement,
  IconButton,
  useToast,
  useMediaQuery,
  Flex,
  Image,
} from '@chakra-ui/react';
import { LockIcon, AtSignIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { api_url } from '@/utils';
import Auditar from '@/services/AuditoriaHook';

import logoSofmar from '@/assets/logos/logo_sofmar.png';
import bgLogin from '@/assets/bg/login_bg.jpg';
// import { traerConfiguraciones } from '@/services/ConfiguracionesHook';
import { getConfiguraciones } from '@/services/ConfiguracionesHook';

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [, setPermisos] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const userID = parseInt(sessionStorage.getItem('user_id') || '0');
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  const ingresar = async () => {
    try {
      const response = await axios.post(`${api_url}usuarios/login`, {
        user: usuario,
        pass: password,
      });

      // const permisosData = await traerConfiguraciones();
      // setPermisos(permisosData);
      login(response.data.body);
      sessionStorage.setItem('permiso_graficos', response.data.body.usuario[0].op_graficos);
      navigate('/home');
      Auditar(10, 4, userID, 0, 'Inicio de Sesión desde la web');
      getConfiguraciones();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Credenciales Incorrectas',
        description: 'Verifique los datos e intente nuevamente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };


  return (
    <Box w={'100%'} h={'100vh'} alignItems={'center'} justifyContent={'center'} display={'flex'} bg={'gray.50'}>
      <Flex
        borderRadius={'md'}
        boxShadow={'xs'}
        w={isMobile ? '100%' : '50%'}
        h={isMobile? '100%' : '70%'}
        bg={'white'}
        flexDir={isMobile ? 'column' : 'row'}
      >
        <Flex 
          w={isMobile ? '100%' : '50%'} 
          h={isMobile ? '40%' : '100%'}
          bgImage={`url(${bgLogin})`} 
          bgRepeat={'no-repeat'} 
          bgPosition={isMobile? 'bottom' : 'center'}
          backgroundSize="cover"
        />

        <Flex 
          w={isMobile ? '100%' : '50%'}
          h={isMobile ? '60%' : '100%'}
          padding={isMobile ? 2 : 8} 
          flexDir={'column'} 
          justifyContent={'center'} 
          alignItems={'center'}
          gap={isMobile? 2 : 6}
          borderTopLeftRadius={isMobile? 50 : 0}
          borderTopRightRadius={isMobile? 50 : 0}
        >
          <Image src={logoSofmar} w={isMobile? '150px' : '250px'} />
          <Heading size={isMobile ? 'lg' : 'xl'}>Iniciar Sesión</Heading>
          <Text fontSize={isMobile? 'sm' : 'md'} color="gray.500">Ingrese sus credenciales para acceder</Text>
          <FormControl>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <AtSignIcon color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoCapitalize="none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    ingresar();
                  }
                }}
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <LockIcon color="gray.300" />
              </InputLeftElement>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoCapitalize="none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    ingresar();
                  }
                }}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Button colorScheme="blue" width="100%" onClick={ingresar}>
            Ingresar
          </Button>

          <Box alignItems={'center'} textAlign={'center'} mt={4}>
          <Text fontWeight={'bold'} fontSize={isMobile? 'xs' : 'md'} color={'gray.500'}>Celular: 0971 271 288</Text>
          <Text fontWeight={'bold'} fontSize={isMobile? 'xs' : 'md'} color={'gray.500'}>E-Mail: administracion@sofmarsistemas.net</Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Login;
