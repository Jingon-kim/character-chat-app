import { NextRequest } from 'next/server';
import charactersData from '@/data/characters.json';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { characterId, message, history } = await request.json();

    // Find character
    const character = charactersData.characters.find(c => c.id === characterId);
    if (!character) {
      return new Response(JSON.stringify({ error: 'Character not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build messages
    const messages = [
      { role: 'system', content: character.systemPrompt },
      ...(history || []).slice(-10).map((msg: any) => ({
        role: msg.senderType === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Check if API key exists
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('placeholder')) {
      // Return mock response for development
      const mockResponses: Record<string, string[]> = {
        minsu: [
          '야 ㅋㅋㅋ 그거 진짜 웃기다',
          '오 대박 ㄹㅇ?',
          '아 배고파... 뭐 먹을까?',
          '게임하자 게임!! 🎮',
        ],
        yujin: [
          '그렇구나. 잘 생각해봐.',
          '음, 나쁘지 않은 것 같아.',
          '효율적으로 하는 게 좋을 것 같은데.',
          '카페 가서 얘기할까?',
        ],
        hana: [
          '와 정말? 그거 너무 좋다~!',
          '음... 어떻게 생각해?',
          '그랬구나... 힘들었겠다 ㅠㅠ',
          '오늘 날씨 좋다~ 산책 갈래?',
        ],
        sora: [
          '헐 대박!! 진짜?!',
          '완전 찐이야!! 💕',
          '가자가자~ 놀러가자!!',
          '이거 봤어?? 완전 핫함!!',
        ],
        rina: [
          '됐어, 알겠어.',
          '그건 아닌 것 같은데.',
          'Time is money.',
          '다시 생각해봐.',
        ],
        mika: [
          '...재밌네.',
          '그런 날도 있지.',
          '비 온 뒤에 땅이 굳는 법이야.',
          '더 얘기해봐.',
        ],
        jun: [
          '...응.',
          '알았어.',
          '가자.',
          '괜찮아?',
        ],
        yuki: [
          '그랬구나... 많이 힘들었겠다.',
          '저도 그 생각 해봤어요.',
          '괜찮아요, 천천히요.',
          '커피 한 잔 할래요?',
        ],
      };

      const responses = mockResponses[characterId] || ['안녕!'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // Simulate streaming with mock data
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // Simulate typing delay
          await new Promise(resolve => setTimeout(resolve, 500));

          // Send response character by character for realistic effect
          for (const char of randomResponse) {
            const data = JSON.stringify({
              choices: [{ delta: { content: char } }]
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 30));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Real API call
    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
        messages,
        stream: true,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    // Forward the stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
