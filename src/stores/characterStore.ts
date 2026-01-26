import { create } from 'zustand';
import { Character } from '@/types/character';
import charactersData from '@/data/characters.json';

interface CharacterState {
  characters: Character[];
  selectedCharacter: Character | null;
  isModalOpen: boolean;
  setSelectedCharacter: (character: Character | null) => void;
  openModal: (character: Character) => void;
  closeModal: () => void;
  getCharacterById: (id: string) => Character | undefined;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: charactersData.characters as Character[],
  selectedCharacter: null,
  isModalOpen: false,

  setSelectedCharacter: (character) => set({ selectedCharacter: character }),

  openModal: (character) => set({
    selectedCharacter: character,
    isModalOpen: true
  }),

  closeModal: () => set({
    isModalOpen: false
  }),

  getCharacterById: (id) => {
    return get().characters.find(c => c.id === id);
  },
}));
