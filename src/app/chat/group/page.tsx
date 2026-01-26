'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import { useCharacterStore } from '@/stores/characterStore';
import { Message } from '@/types/chat';
import { Character } from '@/types/character';

// 대기 중인 캐릭터들 표시 컴포넌트
function WaitingIndicator({
  currentCharacter,
  waitingCharacters
}: {
  currentCharacter: Character;
  waitingCharacters: Character[];
}) {
  return (
    <div className="flex items-start gap-2.5 mb-3 animate-fade-in">
      <div className="relative w-9 h-9 flex-shrink-0">
        <Image
          src={`/characters/${currentCharacter.image}`}
          alt={currentCharacter.name}
          fill
          className="rounded-full object-cover ring-2 ring-purple-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-slate-700/50 px-4 py-3 rounded-2xl rounded-tl">
          <p className="text-purple-400 text-xs font-semibold mb-1">{currentCharacter.name}</p>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        {waitingCharacters.length > 0 && (
          <div className="flex items-center gap-1.5 ml-1">
            <div className="flex -space-x-1.5">
              {waitingCharacters.map(char => (
                <div key={char.id} className="relative w-5 h-5 border border-slate-800 rounded-full opacity-50">
                  <Image
                    src={`/characters/${char.image}`}
                    alt={char.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-slate-500 text-xs">대기 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GroupChatPage() {
  const router = useRouter();
  const { characters } = useCharacterStore();

  // Default group: 민수, 하나, 유진
  const [selectedIds] = useState(['minsu', 'hana', 'yujin']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [waitingCharacters, setWaitingCharacters] = useState<Character[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedCharacters = characters.filter(c => selectedIds.includes(c.id));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, currentCharacter]);

  const getCharacterById = (id: string) => characters.find(c => c.id === id);

  const handleSend = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      roomId: 'group',
      senderType: 'user',
      senderId: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsProcessing(true);

    // 모든 캐릭터를 대기열에 추가
    const charactersToRespond = [...selectedCharacters];

    // 각 캐릭터 순차 처리
    for (let i = 0; i < charactersToRespond.length; i++) {
      const character = charactersToRespond[i];
      const remaining = charactersToRespond.slice(i + 1);

      setCurrentCharacter(character);
      setWaitingCharacters(remaining);
      setStreamingContent('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: character.id,
            message: content,
            history: messages.slice(-6),
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
                  const text = parsed.choices?.[0]?.delta?.content || '';
                  fullContent += text;
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
          id: `${Date.now()}-${character.id}`,
          roomId: 'group',
          senderType: 'character',
          senderId: character.id,
          content: fullContent || '...',
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);

        // 다음 캐릭터로 전환 전 짧은 딜레이
        if (i < charactersToRespond.length - 1) {
          setStreamingContent('');
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error('Chat error:', error);
      }
    }

    setIsProcessing(false);
    setCurrentCharacter(null);
    setWaitingCharacters([]);
    setStreamingContent('');
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-white text-xl p-1">
          ←
        </button>
        <div className="flex -space-x-2">
          {selectedCharacters.map(char => (
            <div key={char.id} className="relative w-9 h-9 border-2 border-slate-900 rounded-full">
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
          <h1 className="text-white font-semibold">그룹 채팅</h1>
          <p className="text-slate-400 text-xs">{selectedCharacters.map(c => c.name).join(', ')}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !isProcessing && (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm mb-2">👥 그룹 채팅방</p>
            <p className="text-slate-500 text-xs">
              {selectedCharacters.map(c => c.name).join(', ')}와(과) 함께 대화해보세요!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            character={msg.senderType === 'character' ? getCharacterById(msg.senderId) : undefined}
            isUser={msg.senderType === 'user'}
          />
        ))}

        {/* 현재 응답 중인 캐릭터 표시 */}
        {isProcessing && currentCharacter && !streamingContent && (
          <WaitingIndicator
            currentCharacter={currentCharacter}
            waitingCharacters={waitingCharacters}
          />
        )}

        {/* 스트리밍 중인 메시지 */}
        {streamingContent && currentCharacter && (
          <>
            <ChatBubble
              message={{
                id: 'streaming',
                roomId: 'group',
                senderType: 'character',
                senderId: currentCharacter.id,
                content: streamingContent,
                createdAt: new Date().toISOString(),
              }}
              character={currentCharacter}
            />
            {waitingCharacters.length > 0 && (
              <div className="flex items-center gap-1.5 ml-12 mb-3">
                <div className="flex -space-x-1.5">
                  {waitingCharacters.map(char => (
                    <div key={char.id} className="relative w-5 h-5 border border-slate-800 rounded-full opacity-50">
                      <Image
                        src={`/characters/${char.image}`}
                        alt={char.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-slate-500 text-xs">대기 중...</span>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isProcessing} />
    </div>
  );
}
