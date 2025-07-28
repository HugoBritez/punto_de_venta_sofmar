import { useEffect, useState, useCallback } from "react";

// Corrige la importación de io, que debe ser el default export
import { Socket } from "socket.io-client";
import io from "socket.io-client";

import { Chat, Message, WebSocketMessage } from "../types/whatsapp.types";
import { config } from "@/config/env";


const SOCKET_URL = config.webSocketUri ||  "https://meta-microservice-19rg.onrender.com";


export const useSocket = () => {
    const [socket, setSocket] = useState<typeof Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=> {
        const newSocket = io(SOCKET_URL, {
            transports : ["websocket", "polling"],
        });

        newSocket.on("connect", ()=> {
            setConnected(true);


            newSocket.emit('authenticate', {
                token: sessionStorage.getItem('token'),
                clientId: `sofmar_crm_${sessionStorage.getItem('user_id') + Math.random().toString(36).substring(2, 15)}`,
            })
        });

        newSocket.on('authenticated', (data: any)=> {
            console.log('Autenticado', data)
        })

        newSocket.on("disconnect", ()=> {
            setConnected(false);
        })


        newSocket.on("chat_list", (data: {chats: Chat[], total: number})=>{
            setChats(data.chats);
            setIsLoading(false);
        })

        newSocket.on('chat_messages', (data :{ chatId: string, messages: Message[], hasMore: boolean})=> {
            setMessages(prev => ({
                ...prev,
                [data.chatId]: data.messages
            }))
        });

        newSocket.on('new_message', (notification: WebSocketMessage) => {
            console.log('🔔 Nuevo mensaje:', notification);
            
            // Actualizar mensajes del chat
            if (notification.type === 'new_message') {
              setMessages(prev => ({
                ...prev,
                [notification.chatId]: [
                  ...(prev[notification.chatId] || []),
                  notification.data
                ]
              }));
      
              // Actualizar lista de chats (mover al tope)
              setChats(prev => {
                const updatedChats = prev.filter(chat => chat.chatId !== notification.chatId);
                const targetChat = prev.find(chat => chat.chatId === notification.chatId);
                
                if (targetChat) {
                  targetChat.lastMessage = notification.timestamp;
                  targetChat.lastMessageContent = notification.data.content?.text?.body || 'Nuevo mensaje';
                  targetChat.unreadCount += 1;
                  return [targetChat, ...updatedChats];
                }
                
                return prev;
              });
            }
          });

          newSocket.on('chat_updated', (data: any) => {
            console.log('📱 Chat actualizado:', data);
            
            // Actualizar el chat en la lista
            setChats(prev => {
              const chatIndex = prev.findIndex(chat => chat.chatId === data.chatId);
              
              if (chatIndex !== -1) {
                // Chat existe, actualizarlo
                const updatedChats = [...prev];
                const chatToUpdate = { ...updatedChats[chatIndex] };
                
                // Actualizar propiedades del chat
                if (data.lastMessage) chatToUpdate.lastMessage = new Date(data.lastMessage);
                if (data.lastMessageContent) chatToUpdate.lastMessageContent = data.lastMessageContent;
                if (data.unreadIncrement) chatToUpdate.unreadCount += data.unreadIncrement;
                
                // Remover del array y agregar al principio
                updatedChats.splice(chatIndex, 1);
                return [chatToUpdate, ...updatedChats];
              } else {
                // Chat no existe, podría ser nuevo - solicitar lista actualizada
                return prev;
              }
            });
          });
      
          newSocket.on('error', (error: string) => {
            console.error('❌ Error WebSocket:', error);
            setIsLoading(false);
          });

          setSocket(newSocket);

          return ()=> {
            newSocket.close()
          }
    }, [])

    const getChatList = useCallback((options?: { limit?: number, unreadOnly?: boolean }) => {
        if (socket && connected) {
          setIsLoading(true);
          socket.emit('get_chat_list', {
            limit: options?.limit || 20,
            unreadOnly: options?.unreadOnly || false
          });
        }
      }, [socket, connected]);
    
      const getChatMessages = useCallback((chatId: string, options?: { limit?: number, offset?: number }) => {
        if (socket && connected) {
          socket.emit('get_chat_messages', {
            chatId,
            limit: options?.limit || 50,
            offset: options?.offset || 0
          });
        }
      }, [socket, connected]);
    
      const subscribeToChat = useCallback((chatId: string) => {
        if (socket && connected) {
          socket.emit('subscribe_chat', chatId);
        }
      }, [socket, connected]);
    
      const unsubscribeFromChat = useCallback((chatId: string) => {
        if (socket && connected) {
          socket.emit('unsubscribe_chat', chatId);
        }
      }, [socket, connected]);
    
      const markChatAsRead = useCallback((chatId: string) => {
        if (socket && connected) {
          socket.emit('mark_chat_read', chatId);
          
          // Actualizar estado local
          setChats(prev => 
            prev.map(chat => 
              chat.chatId === chatId 
                ? { ...chat, unreadCount: 0 }
                : chat
            )
          );
        }
      }, [socket, connected]);
    
      return {
        connected,
        chats,
        messages,
        isLoading,
        getChatList,
        getChatMessages,
        subscribeToChat,
        unsubscribeFromChat,
        markChatAsRead
      };
}