import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          age: number | null;
          occupation: string | null;
          mbti: string | null;
          personality: Record<string, unknown> | null;
          speech_style: Record<string, unknown> | null;
          system_prompt: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['characters']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['characters']['Insert']>;
      };
      chat_rooms: {
        Row: {
          id: string;
          user_id: string;
          type: 'single' | 'group' | 'spectate';
          character_ids: string[];
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_rooms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['chat_rooms']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_type: 'user' | 'character';
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
    };
  };
}
