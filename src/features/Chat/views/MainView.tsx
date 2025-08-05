import { Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatList from "./ChatLists";
import { ChatView } from "./ChatView";
import { Chat } from "../types/whatsapp.types";
import { useChat } from "@/shared/hooks/useChat";
import { ContactoCRMModel } from "@/features/CRM/types/contactos.type";

export const ChatMainView = ({ contactos }: { contactos: ContactoCRMModel[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');

    const { getChatList, connected, chats } = useChat();

    useEffect(() => {
        if (connected) {
            getChatList({ limit: 20 });
        }
    }, [connected, getChatList]);

    const handleChatSelect = (chat: Chat) => {
        setSelectedChat(chat);
        setCurrentView('chat');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedChat(null);
    };

    return (
        <>
            {/* Botón flotante */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex flex-row w-[12rem] h-[3.5rem] absolute bottom-10 left-28 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg items-center justify-center gap-3 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                        onClick={() => setIsOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Mail className="w-5 h-5 text-white" />
                        <p className="text-white text-sm font-semibold">Mensajes</p>
                        {
                            chats.filter(chat => chat.unreadCount > 0).length > 0 && (
                                <div className="w-6 h-6 bg-red-500 rounded-full relative right-0 top-0 flex items-center justify-center ease-in-out duration-300 ">
                                    <p className="text-white text-xs font-semibold">{chats.filter(chat => chat.unreadCount > 0).length}</p>
                                </div>
                            )
                        }
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Backdrop con blur y oscurecimiento */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Ventana de chat */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col w-[32rem] h-[52rem] absolute bottom-10 left-28 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <motion.div 
                            className="flex flex-row items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                <p className="text-gray-700 text-lg font-semibold">Mensajes</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </motion.button>
                        </motion.div>

                        {/* Contenido del chat */}
                        <motion.div 
                            className="flex-1 px-0 py-0 overflow-y-auto h-full hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            {currentView === 'list' ? (
                                <ChatList onChatSelect={handleChatSelect} contactos={contactos} />
                            ) : (
                                <ChatView 
                                    chat={selectedChat} 
                                    onBack={handleBackToList} 
                                    contactos={contactos}
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};