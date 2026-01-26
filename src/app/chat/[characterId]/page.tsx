'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useCharacterStore } from '@/stores/characterStore';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/types/chat';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.characterId as string;

  const { characters, getCharacterById } = useCharacterStore();
  const { messages, addMessage, clearMessages } = useChatStore();

  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const character = getCharacterById(characterId);
  const chatMessages = messages[characterId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingContent]);

  const handleSend = async (content: string) => {
    if (!character) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      roomId: characterId,
      senderType: 'user',
      senderId: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(characterId, userMessage);

    // Start typing indicator
    setIsTyping(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          message: content,
          history: chatMessages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                fullContent += content;
                setStreamingContent(fullContent);
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        roomId: characterId,
        senderType: 'character',
        senderId: characterId,
        content: fullContent || '...',
        createdAt: new Date().toISOString(),
      };
      addMessage(characterId, aiMessage);

    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        roomId: characterId,
        senderType: 'character',
        senderId: characterId,
        content: '앗, 잠시 문제가 생겼어. 다시 말해줄래?',
        createdAt: new Date().toISOString(),
      };
      addMessage(characterId, errorMessage);
    } finally {
      setIsTyping(false);
      setStreamingContent('');
    }
  };

  if (!character) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <p className="text-white">캐릭터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-white text-xl p-1"
        >
          ←
        </button>
        <div className="relative w-10 h-10">
          <Image
            src={`/characters/${character.image}`}
            alt={character.name}
            fill
            className="rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
        </div>
        <div>
          <h1 className="text-white font-semibold">{character.name}</h1>
          <p className="text-slate-400 text-xs">{character.occupation}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-10">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image
                src={`/characters/${character.image}`}
                alt={character.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <p className="text-slate-400 text-sm">
              {character.name}와(과) 대화를 시작해보세요!
            </p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            character={msg.senderType === 'character' ? character : undefined}
            isUser={msg.senderType === 'user'}
          />
        ))}

        {isTyping && !streamingContent && (
          <TypingIndicator character={character} />
        )}

        {streamingContent && (
          <ChatBubble
            message={{
              id: 'streaming',
              roomId: characterId,
              senderType: 'character',
              senderId: characterId,
              content: streamingContent,
              createdAt: new Date().toISOString(),
            }}
            character={character}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
