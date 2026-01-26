'use client';

import Image from 'next/image';
import { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
  isOnline?: boolean;
}

export default function CharacterCard({ character, onClick, isOnline = false }: CharacterCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 border border-slate-700/50"
    >
      {/* Online Status */}
      {isOnline && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
      )}

      {/* Gradient Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-t-2xl" />

      {/* Avatar */}
      <div className="relative w-16 h-16 mx-auto mb-3">
        <Image
          src={`/characters/${character.image}`}
          alt={character.name}
          fill
          className="rounded-full object-cover border-2 border-slate-900"
        />
      </div>

      {/* Info */}
      <h3 className="text-base font-semibold text-white text-center mb-1">
        {character.name}
      </h3>
      <p className="text-xs text-slate-400 text-center mb-3">
        {character.occupation}
      </p>

      {/* Tags */}
      <div className="flex gap-1.5 justify-center flex-wrap">
        <span className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md">
          {character.mbti}
        </span>
        <span className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md">
          {character.age}세
        </span>
      </div>
    </div>
  );
}
