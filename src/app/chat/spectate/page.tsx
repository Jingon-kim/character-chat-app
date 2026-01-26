'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ChatBubble from '@/components/chat/ChatBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useCharacterStore } from '@/stores/characterStore';
import { Message } from '@/types/chat';
import { Character } from '@/types/character';

export default function SpectatePage() {
  const router = useRouter();
  const { characters } = useCharacterStore();

  // Spectate group: 민수, 하나, 유진, 소라
  const [selectedIds] = useState(['minsu', 'hana', 'yujin', 'sora']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingCharacter, setTypingCharacter] = useState<Character | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedCharacters = characters.filter(c => selectedIds.includes(c.id));
  const getCharacterById = (id: string) => characters.find(c => c.id === id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const generateAutoChat = useCallback(async () => {
    if (isPaused || isTyping || selectedCharacters.length === 0) return;

    // Pick random character
    const randomIndex = Math.floor(Math.random() * selectedCharacters.length);
    const character = selectedCharacters[randomIndex];

    // Build context from recent messages
    const recentMessages = messages.slice(-5);
    const lastMessage = recentMessages[recentMessages.length - 1];

    let prompt = '자연스럽게 대화를 이어가줘. 짧게 1-2문장으로.';
    if (lastMessage) {
      const lastChar = getCharacterById(lastMessage.senderId);
      if (lastChar) {
        prompt = `${lastChar.name}가 "${lastMessage.content}"라고 했어. 자연스럽게 반응해줘. 짧게.`;
      }
    } else {
      prompt = '친구들이랑 있어. 가볍게 대화 시작해줘.';
    }

    setIsTyping(true);
    setTypingCharacter(character);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          message: prompt,
          history: recentMessages,
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
                // Skip
              }
            }
          }
        }
      }

      const aiMessage: Message = {
        id: `${Date.now()}-${character.id}`,
        roomId: 'spectate',
        senderType: 'character',
        senderId: character.id,
        content: fullContent || '...',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Auto chat error:', error);
    } finally {
      setIsTyping(false);
      setTypingCharacter(null);
      setStreamingContent('');
    }
  }, [isPaused, isTyping, selectedCharacters, messages, getCharacterById]);

  // Auto generate chat
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const interval = (5000 / speed);
    intervalRef.current = setInterval(generateAutoChat, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, speed, generateAutoChat]);

  // Initial message
  useEffect(() => {
    if (messages.length === 0 && !isTyping) {
      generateAutoChat();
    }
  }, []);

  const handleJoin = () => {
    router.push('/chat/group');
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white text-xl p-1">
            ←
          </button>
          <div className="flex -space-x-2">
            {selectedCharacters.slice(0, 4).map(char => (
              <div key={char.id} className="relative w-8 h-8 border-2 border-slate-900 rounded-full">
                <Image
                  src={`/characters/${char.image}`}
                  alt={char.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ))}
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">관전 모드</h1>
            <p className="text-slate-400 text-xs">👀 지켜보는 중...</p>
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeed(s => Math.max(0.5, s - 0.5))}
            className="text-slate-400 text-sm px-2"
          >
            -
          </button>
          <span className="text-white text-sm">{speed}x</span>
          <button
            onClick={() => setSpeed(s => Math.min(3, s + 0.5))}
            className="text-slate-400 text-sm px-2"
          >
            +
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            character={getCharacterById(msg.senderId)}
            isUser={false}
          />
        ))}

        {isTyping && typingCharacter && !streamingContent && (
          <TypingIndicator character={typingCharacter} />
        )}

        {streamingContent && typingCharacter && (
          <ChatBubble
            message={{
              id: 'streaming',
              roomId: 'spectate',
              senderType: 'character',
              senderId: typingCharacter.id,
              content: streamingContent,
              createdAt: new Date().toISOString(),
            }}
            character={typingCharacter}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
            isPaused
              ? 'bg-green-500 text-white'
              : 'bg-slate-700 text-white'
          }`}
        >
          {isPaused ? '▶️ 재개' : '⏸️ 일시정지'}
        </button>
        <button
          onClick={handleJoin}
          className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl text-sm"
        >
          💬 끼어들기
        </button>
      </div>
    </div>
  );
}
