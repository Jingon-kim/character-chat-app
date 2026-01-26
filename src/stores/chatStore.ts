import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChatRoom } from '@/types/chat';

interface ChatState {
  currentRoom: ChatRoom | null;
  messages: Record<string, Message[]>; // characterId -> messages
  isLoading: boolean;

  setCurrentRoom: (room: ChatRoom | null) => void;
  addMessage: (roomId: string, message: Message) => void;
  getMessages: (roomId: string) => Message[];
  clearMessages: (roomId?: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentRoom: null,
      messages: {},
      isLoading: false,

      setCurrentRoom: (room) => set({ currentRoom: room }),

      addMessage: (roomId, message) => set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: [...(state.messages[roomId] || []), message]
        }
      })),

      getMessages: (roomId) => get().messages[roomId] || [],

      clearMessages: (roomId) => {
        if (roomId) {
          set((state) => ({
            messages: {
              ...state.messages,
              [roomId]: []
            }
          }));
        } else {
          set({ messages: {} });
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
