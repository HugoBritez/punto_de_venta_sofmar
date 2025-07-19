import { useMediaQuery } from '@chakra-ui/react';

const Home = () => {
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <img 
        src={isMobile ? '/homebgresponsive.svg' : '/homebg.svg'} 
        alt="Fondo del dashboard"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default Home
