export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string | null;
          id: string;
          is_primary: boolean | null;
          name: string;
          phone: string;
          relationship: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          name: string;
          phone: string;
          relationship: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          name?: string;
          phone?: string;
          relationship?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          alerts: Json | null;
          created_at: string | null;
          ended_at: string | null;
          id: string;
          location: Json;
          peak_score: number | null;
          signal_trace: Json | null;
          started_at: string;
          status: string;
          trigger: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          alerts?: Json | null;
          created_at?: string | null;
          ended_at?: string | null;
          id?: string;
          location: Json;
          peak_score?: number | null;
          signal_trace?: Json | null;
          started_at?: string;
          status: string;
          trigger: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          alerts?: Json | null;
          created_at?: string | null;
          ended_at?: string | null;
          id?: string;
          location?: Json;
          peak_score?: number | null;
          signal_trace?: Json | null;
          started_at?: string;
          status?: string;
          trigger?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          blood_type: string | null;
          id: string;
          medical_note: string | null;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          blood_type?: string | null;
          id: string;
          medical_note?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          blood_type?: string | null;
          id?: string;
          medical_note?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          channels: Json;
          thresholds: Json;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          channels?: Json;
          thresholds?: Json;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          channels?: Json;
          thresholds?: Json;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
