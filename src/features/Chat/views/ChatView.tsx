import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Chat, Message } from "../types/whatsapp.types";
import { useChat } from "@/shared/hooks/useChat";
import { useSendMessage } from "../Hooks/useSendMessage";
import { ContactoCRMModel } from "@/features/CRM/types/contactos.type";
import { getContactName } from "../utils/getContactName";
import { formatFileUrl } from "../utils/formatFileUrl";

interface ChatViewProps {
    chat: Chat | null;
    onBack: () => void;
    contactos: ContactoCRMModel[];
}

export const ChatView: React.FC<ChatViewProps> = ({ chat, onBack, contactos }) => {
    const { messages, getChatMessages } = useChat();
    const { sendMessage, isPending } = useSendMessage();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Obtener mensajes cuando se selecciona un chat
    useEffect(() => {
        if (chat?.chatId) {
            getChatMessages(chat.chatId);
        }
    }, [chat?.chatId, getChatMessages]);

    // Scroll instantáneo al final cuando cambian los mensajes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
        }
    }, [messages[chat?.chatId || '']]);

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
        if (newMessage.trim() && chat) {
            sendMessage({
                to: chat.metadata.phoneNumberId,
                text: newMessage.trim(),
                chatId: chat.chatId
            });
            setNewMessage("");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'read': return '✓✓'; // Puedes usar diferente color
            case 'failed': return '✗';
            default: return '⏳';
        }
    };

    const renderMessageContent = (message: Message) => {
        // Si es media y está procesado
        if (message.content?.media?.status === 'processed') {
            return (
                <div className="space-y-2">
                    <img
                        src={formatFileUrl(message.content.media.downloadUrl)}
                        alt="Media"
                        className="max-w-full h-auto rounded-lg"
                        onError={(e) => {
                            console.error('Error cargando imagen:', e);
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    {message.content.media.caption && (
                        <p className="text-sm">{message.content.media.caption}</p>
                    )}
                </div>
            );
        }

        // Si es media y está pendiente
        if (message.content?.media?.status === 'pending') {
            return (
                <div className="flex items-center space-x-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                    <span className="text-sm">Procesando imagen...</span>
                </div>
            );
        }

        // Si es media con error
        if (message.content?.media?.status === 'error') {
            return (
                <div className="text-red-500 text-sm">
                    ❌ Error procesando media
                </div>
            );
        }

        // Mensaje de texto normal
        return (
            <p>{message.content?.text?.body || 'Mensaje sin contenido'}</p>
        );
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
                    <p className="font-semibold text-gray-900">{getContactName(contactos, chat.metadata.phoneNumberId)}</p>
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
                            className={`flex ${message.from === chat.metadata.phoneNumberId
                                    ? 'justify-start'
                                    : 'justify-end'
                                }`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.from === chat.metadata.phoneNumberId
                                        ? 'bg-gray-200 text-gray-800'
                                        : 'bg-blue-500 text-white'
                                    }`}
                            >
                                {/* Contenido del mensaje */}
                                <div className="text-sm">
                                    {renderMessageContent(message)}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <p className={`text-xs ${message.from === chat.metadata.phoneNumberId
                                            ? 'text-gray-500'
                                            : 'text-blue-100'
                                        }`}>
                                        {formatMessageTime(message.timestamp)}
                                    </p>
                                    {/* Mostrar estado solo para mensajes enviados por nosotros */}
                                    {message.from !== chat.metadata.phoneNumberId && (
                                        <span className={`text-xs ${message.status === 'read' ? 'text-blue-200' : 'text-blue-100'
                                            }`}>
                                            {getStatusIcon(message.status)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
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
                        disabled={!newMessage.trim() || isPending}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}