import { useSocketContext } from "../Context/WhatsappSocketContext";


export const useChat = () => {
    return useSocketContext()
}