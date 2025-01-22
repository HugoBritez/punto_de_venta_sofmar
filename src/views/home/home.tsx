import bgHomeSm from '@/assets/bg/fondodashboardResponsive.png';
import bgHomeLg from '@/assets/bg/fondodashboard.png';
import { useMediaQuery } from '@chakra-ui/react';
import { Box, Image } from '@chakra-ui/react';



const Home = () => {
    const [isMobile] = useMediaQuery('(max-width: 768px)');
  return (
    <Box w="100vw" h="100vh">
      <Image 
        src={isMobile ? bgHomeSm : bgHomeLg} 
        alt="bgHomeSm"
        w="100%"
        h="100%"
        objectFit="cover"
      />
    </Box>
  )

}

export default Home
