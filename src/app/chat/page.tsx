'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCharacterStore } from '@/stores/characterStore';
import { useChatStore } from '@/stores/chatStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function ChatListPage() {
  const router = useRouter();
  const { characters } = useCharacterStore();
  const { messages } = useChatStore();

  // Get characters with chat history
  const chatsWithHistory = characters
    .filter(char => messages[char.id]?.length > 0)
    .map(char => {
      const charMessages = messages[char.id] || [];
      const lastMessage = charMessages[charMessages.length - 1];
      return {
        character: char,
        lastMessage,
        messageCount: charMessages.length,
      };
    })
    .sort((a, b) => {
      const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
      return timeB - timeA;
    });

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24">
      <Header />

      <div className="px-5 py-4">
        <h1 className="text-xl font-bold text-white mb-4">채팅</h1>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => router.push('/chat/group')}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white rounded-xl text-sm font-medium"
          >
            👥 그룹 채팅
          </button>
          <button
            onClick={() => router.push('/chat/spectate')}
            className="flex-1 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm font-medium"
          >
            👀 관전 모드
          </button>
        </div>

        {/* Chat List */}
        {chatsWithHistory.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 mb-2">아직 대화 기록이 없어요</p>
            <p className="text-slate-500 text-sm mb-6">캐릭터를 선택해서 대화를 시작해보세요!</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold"
            >
              캐릭터 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {chatsWithHistory.map(({ character, lastMessage, messageCount }) => (
              <div
                key={character.id}
                onClick={() => router.push(`/chat/${character.id}`)}
                className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={`/characters/${character.image}`}
                    alt={character.name}
                    fill
                    className="rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-white font-semibold">{character.name}</h3>
                    <span className="text-slate-500 text-xs">
                      {new Date(lastMessage.createdAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm truncate">
                    {lastMessage.senderType === 'user' ? '나: ' : ''}
                    {lastMessage.content}
                  </p>
                </div>
                {messageCount > 0 && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {messageCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* All Characters */}
        {chatsWithHistory.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-white mt-8 mb-4">새 대화 시작</h2>
            <div className="grid grid-cols-4 gap-4">
              {characters
                .filter(char => !messages[char.id]?.length)
                .map(char => (
                  <div
                    key={char.id}
                    onClick={() => router.push(`/chat/${char.id}`)}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="relative w-14 h-14 mb-2">
                      <Image
                        src={`/characters/${char.image}`}
                        alt={char.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="text-white text-xs">{char.name}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
