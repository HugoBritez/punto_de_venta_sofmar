import whatsappAxios from "@/config/whatsappAxios";

export const sendMessageService = {
    sendMessage: async ({to, text, chatId}: {to: string, text: string, chatId: string}) => {
        try {
            const response = await whatsappAxios.post('', {
                to,
                text,
                chatId  
            })
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
}