'use client';

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import LiveChatPreview from '@/components/chat/LiveChatPreview';
import CharacterGrid from '@/components/character/CharacterGrid';
import CharacterModal from '@/components/character/CharacterModal';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const onlineCharacterIds = ['minsu', 'yujin', 'hana']; // Mock online status

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24">
      <Header />

      {/* Living Room Section */}
      <section className="px-5 py-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            🏠 거실
          </h2>
          <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse-glow">
            ● LIVE
          </span>
        </div>
        <LiveChatPreview />
      </section>

      {/* Characters Section */}
      <section className="px-5">
        <h2 className="text-lg font-semibold text-white mb-4">캐릭터</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white border border-purple-500'
                : 'bg-transparent text-slate-400 border border-slate-700'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeTab === 'favorites'
                ? 'bg-slate-700 text-white border border-purple-500'
                : 'bg-transparent text-slate-400 border border-slate-700'
            }`}
          >
            즐겨찾기 ⭐
          </button>
        </div>

        <CharacterGrid onlineIds={onlineCharacterIds} />
      </section>

      <BottomNav />
      <CharacterModal />
    </div>
  );
}
