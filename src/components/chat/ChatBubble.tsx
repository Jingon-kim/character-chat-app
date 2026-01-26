'use client';

import Image from 'next/image';
import { Message } from '@/types/chat';
import { Character } from '@/types/character';

interface ChatBubbleProps {
  message: Message;
  character?: Character;
  isUser?: boolean;
}

export default function ChatBubble({ message, character, isUser }: ChatBubbleProps) {
  if (isUser) {
    return (
      <div className="flex justify-end mb-3 animate-fade-in">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-2xl rounded-br max-w-[75%]">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 mb-3 animate-fade-in">
      {character && (
        <div className="relative w-9 h-9 flex-shrink-0">
          <Image
            src={`/characters/${character.image}`}
            alt={character.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
      )}
      <div className="bg-slate-700/50 px-4 py-2.5 rounded-2xl rounded-tl max-w-[75%]">
        {character && (
          <p className="text-purple-400 text-xs font-semibold mb-1">{character.name}</p>
        )}
        <p className="text-white text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
