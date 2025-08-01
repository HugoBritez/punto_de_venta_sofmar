export interface Chat {
    chatId: string;
    participants: string[];
    lastMessage: Date;
    lastMessageContent: string;
    unreadCount: number;
    metadata: {
      contactName: string;
      phoneNumberId: string;
    };
  }
  
  export interface Message {
    _id: string;
    messageId: string;
    chatId: string;
    timestamp: Date;
    from: string;
    to?: string;
  type: string;
    content: any;
    status: string;
  }
  
  export interface WebSocketMessage {
    type: 'new_message' | 'message_status' | 'chat_update';
    chatId: string;
    data: any;
    timestamp: Date;
  }