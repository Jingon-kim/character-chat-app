export interface Message {
  id: string;
  roomId: string;
  senderType: 'user' | 'character';
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  userId: string;
  type: 'single' | 'group' | 'spectate';
  characterIds: string[];
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
}
