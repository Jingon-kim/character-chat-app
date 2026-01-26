'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  characterId: string;
  name: string;
  image: string;
  message: string;
}

const mockMessages: ChatMessage[] = [
  {
    characterId: 'minsu',
    name: '민수',
    image: 'taesup4gi_1boy_male_solo_white_background_simple_background_t_848facd9-b69c-44fc-a3db-a3a445760569_3 (1).png',
    message: '야 오늘 날씨 개좋다ㅋㅋㅋ 어디 갈까?',
  },
  {
    characterId: 'hana',
    name: '하나',
    image: 'taesup4gi_Light_brown_hair_in_a_loose_princess_half-up_blue_d_79db315d-c548-4fe1-9e6e-c89096bf6e9c_2.png',
    message: '카페 어때? 새로 생긴 곳 있던데~!',
  },
  {
    characterId: 'yujin',
    name: '유진',
    image: 'taesup4gi_1girl_solo_white_background_simple_background_three_75c00d6b-d430-4680-b7f7-12e907726cb8_0 (1).png',
    message: '좋아. 작업하기도 좋을 것 같아.',
  },
];

const participants = mockMessages.map(m => ({ id: m.characterId, image: m.image }));

export default function LiveChatPreview() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5">
      {/* Participants */}
      <div className="flex mb-4">
        {participants.map((p, i) => (
          <div
            key={p.id}
            className="relative w-9 h-9 rounded-full border-2 border-slate-900"
            style={{ marginLeft: i > 0 ? '-8px' : 0 }}
          >
            <Image
              src={`/characters/${p.image}`}
              alt=""
              fill
              className="rounded-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 mb-5">
        {mockMessages.map((msg, i) => (
          <div key={i} className="flex items-start gap-2.5 animate-fade-in">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={`/characters/${msg.image}`}
                alt={msg.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="bg-slate-700/50 rounded-2xl rounded-tl px-3.5 py-2.5 max-w-[75%]">
              <p className="text-purple-400 text-xs font-semibold mb-1">{msg.name}</p>
              <p className="text-white text-sm leading-relaxed">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push('/chat/group')}
          className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl transition-transform active:scale-98"
        >
          💬 참여하기
        </button>
        <button
          onClick={() => router.push('/chat/spectate')}
          className="flex-1 py-3.5 bg-slate-700 text-white font-semibold rounded-xl transition-transform active:scale-98"
        >
          👀 관전하기
        </button>
      </div>
    </div>
  );
}
