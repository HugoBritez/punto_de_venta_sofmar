import React, { useEffect, useState } from 'react';
import { Chat } from '../types/whatsapp.types';
import { useChat } from '@/shared/hooks/useChat';
import { ContactoCRMModel } from '@/features/CRM/types/contactos.type';
import { getContactName } from '../utils/getContactName';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  contactos: ContactoCRMModel[];
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect, contactos }) => {
  const {
    connected,
    chats,
    getChatList,
    subscribeToChat,
    markChatAsRead
  } = useChat();

  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  useEffect(() => {
    if (connected) {
      // Obtener lista de chats al conectar
      getChatList({ limit: 20 });
    }
  }, [connected, getChatList]);

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat.chatId);
    subscribeToChat(chat.chatId);
    
    if (chat.unreadCount > 0) {
      markChatAsRead(chat.chatId);
    }

    // Llamar a la función onChatSelect para navegar a ChatView
    onChatSelect(chat);
  };

  const formatLastMessage = (content: string) => {
    return content.length > 50 
      ? content.substring(0, 50) + '...' 
      : content;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando a WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full h-full bg-white shadow-lg overflow-hidden">

      {/* Chat list */}
      <div className="divide-y divide-gray-200 min-h-[calc(100% - 10rem)] overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No hay chats disponibles</p>
            <p className="text-sm mt-2">Envía un mensaje a tu número de WhatsApp para crear un chat</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.chatId}
              onClick={() => handleChatClick(chat)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedChat === chat.chatId ? 'bg-blue-50 border-r-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-lg">
                    {getContactName(contactos, chat.metadata.phoneNumberId).slice(-2)}
                  </span>
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {getContactName(contactos, chat.metadata.phoneNumberId)}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.lastMessage)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {formatLastMessage(chat.lastMessageContent)}
                    </p>
                    
                    {chat.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ChatList;