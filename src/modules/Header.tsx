import { Flex, Heading, useMediaQuery } from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";

interface HeaderComponentProps {
    Icono: LucideIcon;
    titulo: string;
}

const HeaderComponent = ({ Icono, titulo }: HeaderComponentProps) => {
    const [isMobile] = useMediaQuery('(max-width: 48em)');
    return (
        <Flex
            bgGradient="linear(to-r, blue.500, blue.600)"
            color="white"
            p={isMobile ? 4 : 6}
            alignItems="center"
            rounded="lg"
        >
            <Icono size={32} className="mr-2" />
            <Heading size={isMobile ? "sm" : "md"}>{titulo}</Heading>
        </Flex>
    );
};

export default HeaderComponent;
