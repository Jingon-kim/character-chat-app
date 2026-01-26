'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/stores/characterStore';

export default function CharacterModal() {
  const router = useRouter();
  const { selectedCharacter, isModalOpen, closeModal } = useCharacterStore();

  if (!isModalOpen || !selectedCharacter) return null;

  const handleStartChat = () => {
    closeModal();
    router.push(`/chat/${selectedCharacter.id}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      onClick={closeModal}
    >
      <div
        className="bg-slate-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mt-4 mb-6" />

        {/* Profile */}
        <div className="flex flex-col items-center px-6 mb-6">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src={`/characters/${selectedCharacter.image}`}
              alt={selectedCharacter.name}
              fill
              className="rounded-full object-cover border-4 border-purple-500"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {selectedCharacter.name}
          </h2>
          <p className="text-slate-400 mb-3">
            {selectedCharacter.occupation}
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-xl text-sm">
              {selectedCharacter.mbti}
            </span>
            <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-xl text-sm">
              {selectedCharacter.age}세
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-slate-800/50 rounded-2xl mx-6 p-4 mb-6">
          <div className="flex justify-between py-2 border-b border-slate-700/50">
            <span className="text-slate-400 text-sm">성격</span>
            <span className="text-white text-sm">{selectedCharacter.personality.core}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700/50">
            <span className="text-slate-400 text-sm">좋아하는 것</span>
            <span className="text-white text-sm">{selectedCharacter.likes.slice(0, 2).join(', ')}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400 text-sm">싫어하는 것</span>
            <span className="text-white text-sm">{selectedCharacter.dislikes.slice(0, 2).join(', ')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-8">
          <button
            onClick={handleStartChat}
            className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl transition-transform active:scale-98"
          >
            대화하기
          </button>
          <button
            onClick={closeModal}
            className="flex-1 py-4 bg-slate-700 text-white font-semibold rounded-xl transition-transform active:scale-98"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
