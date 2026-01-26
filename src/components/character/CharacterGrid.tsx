'use client';

import { useCharacterStore } from '@/stores/characterStore';
import CharacterCard from './CharacterCard';

interface CharacterGridProps {
  onlineIds?: string[];
}

export default function CharacterGrid({ onlineIds = [] }: CharacterGridProps) {
  const { characters, openModal } = useCharacterStore();

  return (
    <div className="grid grid-cols-2 gap-3">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onClick={() => openModal(character)}
          isOnline={onlineIds.includes(character.id)}
        />
      ))}
    </div>
  );
}
