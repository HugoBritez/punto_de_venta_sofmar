import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageService } from "../services/sendMessageService";
import { useSocketContext } from "@/shared/Context/WhatsappSocketContext";

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    const { addOptimisticMessage } = useSocketContext();

    const { mutate: sendMessage, isPending } = useMutation({
        mutationFn: sendMessageService.sendMessage,
        onMutate: async (variables) => {
            // ⭐ OPTIMISTIC UPDATE SIMPLE: Agregar mensaje inmediatamente
            addOptimisticMessage(variables.chatId, {
                content: {
                    text: {
                        body: variables.text
                    }
                },
                to: variables.to,
                from: 'outgoing_user' // Tu número de WhatsApp Business
            });
        },
        onSuccess: (_data, variables) => {
            // Invalidar lista de chats
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            
            // ✅ AGREGAR: Invalidar mensajes del chat específico
            queryClient.invalidateQueries({ 
                queryKey: ['chat_messages', variables.chatId] 
            });
        },
        onError: (error, _variables) => {
            console.error('Error sending message:', error);
            
            // ⭐ OPCIONAL: Revertir optimistic update en caso de error
            // Podrías implementar una función removeOptimisticMessage si quieres
        }
    })

    return {
        sendMessage,
        isPending
    }
}