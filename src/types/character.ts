export interface Character {
  id: string;
  name: string;
  nameEn: string;
  age: number;
  gender: 'male' | 'female';
  occupation: string;
  mbti: string;
  birthday: string;
  image: string;
  personality: {
    core: string;
    strengths: string[];
    weaknesses: string[];
    hidden: string;
  };
  speechStyle: {
    tone: string;
    features: string[];
    examples: string[];
  };
  background: string;
  likes: string[];
  dislikes: string[];
  relationships: Record<string, {
    type: string;
    detail: string;
  }>;
  systemPrompt: string;
}

export interface CharacterRelationship {
  characterA: string;
  characterB: string;
  type: string;
  affinity: number;
}
