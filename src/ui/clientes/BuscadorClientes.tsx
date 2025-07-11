import Modal from '../modal/Modal'
import BuscarClientes from './BuscarClientes';

interface BuscadorClientesProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSelect?: (cliente: any) => void;
}

const BuscadorClientes = ({ isOpen, setIsOpen, onSelect }: BuscadorClientesProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="h-[calc(100vh-15rem)]"
      maxWidth="max-w-[calc(100vw-60rem)]"
      backgroundColor="bg-gray-100"
    >
      <BuscarClientes
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSelect={onSelect}
      />
    </Modal>
  );
}

export default BuscadorClientes
