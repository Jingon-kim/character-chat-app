'use client';

import Image from 'next/image';
import { Character } from '@/types/character';

interface TypingIndicatorProps {
  character: Character;
}

export default function TypingIndicator({ character }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-2.5 mb-3 animate-fade-in">
      <div className="relative w-9 h-9 flex-shrink-0">
        <Image
          src={`/characters/${character.image}`}
          alt={character.name}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="bg-slate-700/50 px-4 py-3 rounded-2xl rounded-tl">
        <p className="text-purple-400 text-xs font-semibold mb-1">{character.name}</p>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
