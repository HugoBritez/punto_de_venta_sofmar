import type { UsuarioViewModel } from "../../../shared/types/operador";
import Modal from "../../../shared/components/Modal/Modal";
import { TablaVendedores } from "../pages/TablaVendedores";

interface ModalVendedoresProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSelect?: (vendedor: UsuarioViewModel) => void;
}


const ModalVendedores = ({ isOpen, setIsOpen, onSelect }: ModalVendedoresProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            size="h-[calc(100vh-15rem)]"
            maxWidth="max-w-[calc(100vw-70rem)]"
            backgroundColor="bg-blue-100"
        >
            <div className="flex flex-col gap-4 p-2">
                <p className="text-center font-bold text-4xl">Listado de vendedores</p>
                <TablaVendedores
                 onSelect={onSelect}
                 />
            </div>
        </Modal>
    )
}

export default ModalVendedores;