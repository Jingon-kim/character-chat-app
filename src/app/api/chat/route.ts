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

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_DEFAULT_MODEL || 'google/gemini-2.0-flash-001';

    console.log('API Key exists:', !!apiKey);
    console.log('Model:', model);

    // Check if API key exists
    if (!apiKey || apiKey.includes('placeholder')) {
      console.log('Using mock response - no API key');
      // Return mock response for development
      const mockResponses: Record<string, string[]> = {
        minsu: ['야 ㅋㅋㅋ 그거 진짜 웃기다', '오 대박 ㄹㅇ?', '아 배고파... 뭐 먹을까?'],
        yujin: ['그렇구나. 잘 생각해봐.', '음, 나쁘지 않은 것 같아.'],
        hana: ['와 정말? 그거 너무 좋다~!', '음... 어떻게 생각해?'],
        sora: ['헐 대박!! 진짜?!', '완전 찐이야!! 💕'],
        rina: ['됐어, 알겠어.', '그건 아닌 것 같은데.'],
        mika: ['...재밌네.', '그런 날도 있지.'],
        jun: ['...응.', '알았어.'],
        yuki: ['그랬구나... 많이 힘들었겠다.', '저도 그 생각 해봤어요.'],
      };

      const responses = mockResponses[characterId] || ['안녕!'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          await new Promise(resolve => setTimeout(resolve, 500));
          for (const char of randomResponse) {
            const data = JSON.stringify({ choices: [{ delta: { content: char } }] });
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
    console.log('Calling OpenRouter API...');
    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://character-chat-app-iota.vercel.app',
        'X-Title': 'Character Universe',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(JSON.stringify({
        error: 'OpenRouter API error',
        status: response.status,
        details: errorText
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
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
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
