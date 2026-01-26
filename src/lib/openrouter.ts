import { Character } from '@/types/character';
import { Message } from '@/types/chat';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

interface GenerateOptions {
  character: Character;
  messages: Message[];
  userMessage: string;
  otherCharacters?: Character[];
}

function buildSystemPrompt(character: Character, otherCharacters?: Character[]): string {
  let prompt = character.systemPrompt;

  if (otherCharacters && otherCharacters.length > 0) {
    const othersInfo = otherCharacters.map(c => {
      const relationship = character.relationships[c.id];
      return `- ${c.name}: ${relationship?.detail || '아는 사이'}`;
    }).join('\n');

    prompt += `\n\n현재 대화에 참여 중인 다른 캐릭터들:\n${othersInfo}`;
  }

  prompt += `\n\n중요한 규칙:
- 너는 ${character.name}의 성격과 말투를 유지해야 해
- 짧고 자연스럽게 대화해 (1-3문장)
- 이모티콘은 캐릭터 성격에 맞게 사용해
- 절대 AI라고 밝히지 마`;

  return prompt;
}

function formatMessages(messages: Message[], characters: Character[]): { role: string; content: string }[] {
  return messages.slice(-20).map(msg => {
    if (msg.senderType === 'user') {
      return { role: 'user', content: msg.content };
    } else {
      const char = characters.find(c => c.id === msg.senderId);
      return {
        role: 'assistant',
        content: `[${char?.name || '캐릭터'}]: ${msg.content}`
      };
    }
  });
}

export async function generateCharacterResponse({
  character,
  messages,
  userMessage,
  otherCharacters,
}: GenerateOptions): Promise<Response> {
  const systemPrompt = buildSystemPrompt(character, otherCharacters);
  const allCharacters = otherCharacters ? [character, ...otherCharacters] : [character];

  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        ...formatMessages(messages, allCharacters),
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.8,
    }),
  });

  return response;
}

// Non-streaming version for simple responses
export async function generateSimpleResponse({
  character,
  messages,
  userMessage,
}: Omit<GenerateOptions, 'otherCharacters'>): Promise<string> {
  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: character.systemPrompt },
        ...messages.slice(-10).map(m => ({
          role: m.senderType === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}
