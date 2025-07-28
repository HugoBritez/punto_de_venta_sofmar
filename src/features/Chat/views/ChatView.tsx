import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Chat, Message } from "../types/whatsapp.types";
import { useSocket } from "../services/useSocket";

interface ChatViewProps {
  chat: Chat | null;
  onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chat, onBack }) => {
    const { messages, getChatMessages } = useSocket();
    const [newMessage, setNewMessage] = useState("");

    // Obtener mensajes cuando se selecciona un chat
    useEffect(() => {
        if (chat?.chatId) {
            getChatMessages(chat.chatId);
        }
    }, [chat?.chatId, getChatMessages]);

    if (!chat) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Selecciona un chat para comenzar</p>
            </div>
        );
    }

    // Obtener mensajes del chat actual
    const chatMessages = messages[chat.chatId] || [];

    const formatMessageTime = (timestamp: Date) => {
        return new Date(timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            // Aquí implementaremos el envío de mensajes más adelante
            console.log("Enviando mensaje:", newMessage);
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col w-full h-full">
            {/* Botón de atrás y nombre de usuario */}
            <div className="flex flex-row p-4 w-full gap-4 items-center border-b border-gray-200 bg-gray-50">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex flex-col">
                    <p className="font-semibold text-gray-900">{chat.metadata.contactName}</p>
                    <p className="text-sm text-gray-500">{chat.metadata.phoneNumberId}</p>
                </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No hay mensajes en este chat</p>
                    </div>
                ) : (
                    chatMessages.map((message: Message) => (
                        <div
                            key={message._id}
                            className={`flex ${
                                message.from === chat.metadata.phoneNumberId 
                                    ? 'justify-start' 
                                    : 'justify-end'
                            }`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.from === chat.metadata.phoneNumberId
                                        ? 'bg-gray-200 text-gray-800'
                                        : 'bg-blue-500 text-white'
                                }`}
                            >
                                <p className="text-sm">
                                    {message.content?.text?.body || 'Mensaje sin contenido'}
                                </p>
                                <p className={`text-xs mt-1 ${
                                    message.from === chat.metadata.phoneNumberId
                                        ? 'text-gray-500'
                                        : 'text-blue-100'
                                }`}>
                                    {formatMessageTime(message.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Área de envío de mensajes */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}