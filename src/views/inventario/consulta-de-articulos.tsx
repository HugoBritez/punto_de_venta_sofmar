import HeaderComponent from "@/modules/Header"
import { Flex } from "@chakra-ui/react"
import { Archive } from "lucide-react"

const ConsultaArticulos = () => {
  return (
    <Flex bg={'gray.100'} h={'100vh'} w={'100%'} p={2}>
        <div className=" w-full h-full">
            <HeaderComponent Icono={Archive} titulo="Consulta de Artículos" />
            <div className="flex flex-row gap-2 w-full h-[93%] py-2">
                <div className="flex flex-col gap-2 w-[60%] ">
                    <div className="flex flex-row p-2 border border-gray-300 bg-white rounded-md h-[10%]"></div>
                    <div className="flex flex-row p-2 border border-gray-300 bg-white rounded-md h-full"></div>
                </div>
                <div className="flex flex-col gap-2 w-[40%] h-full bg-white rounded-md">

                </div>
            </div>
        </div>
    </Flex>


  )
}

export default ConsultaArticulos
