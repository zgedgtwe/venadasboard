
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwxltfhjrftruithnhtn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3eGx0ZmhqcmZ0cnVpdGhuaHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTU3NjAsImV4cCI6MjA2OTMzMTc2MH0.3v4ueyKstLCC4ZGzWpkeHYCafQVfIYYXkDrMKuwhjcg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          company_name: string;
          website: string;
          address: string;
          bank_account: string;
          bio: string;
          income_categories: string[];
          expense_categories: string[];
          project_types: string[];
          event_types: string[];
          notification_settings: any;
          security_settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          since: string;
          instagram: string | null;
          status: string;
          last_contact: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          name: string;
          contact_channel: string;
          location: string;
          status: string;
          date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      packages: {
        Row: {
          id: string;
          name: string;
          price: number;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['packages']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['packages']['Insert']>;
      };
      addons: {
        Row: {
          id: string;
          name: string;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['addons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['addons']['Insert']>;
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          email: string;
          phone: string;
          standard_fee: number;
          reward_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          project_name: string;
          client_name: string;
          client_id: string;
          project_type: string;
          package_name: string;
          package_id: string;
          addons: any[];
          date: string;
          deadline_date: string | null;
          location: string;
          progress: number;
          status: string;
          total_cost: number;
          amount_paid: number;
          payment_status: string;
          team: any[];
          notes: string | null;
          accommodation: string | null;
          drive_link: string | null;
          start_time: string | null;
          end_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          date: string;
          description: string;
          amount: number;
          type: string;
          project_id: string | null;
          category: string;
          method: string;
          pocket_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      financial_pockets: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          type: string;
          amount: number;
          goal_amount: number | null;
          lock_end_date: string | null;
          members: any[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['financial_pockets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['financial_pockets']['Insert']>;
      };
      team_project_payments: {
        Row: {
          id: string;
          project_id: string;
          team_member_name: string;
          team_member_id: string;
          date: string;
          status: string;
          fee: number;
          reward: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_project_payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['team_project_payments']['Insert']>;
      };
      team_payment_records: {
        Row: {
          id: string;
          record_number: string;
          team_member_id: string;
          date: string;
          project_payment_ids: string[];
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_payment_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['team_payment_records']['Insert']>;
      };
      reward_ledger_entries: {
        Row: {
          id: string;
          team_member_id: string;
          date: string;
          description: string;
          amount: number;
          project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reward_ledger_entries']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reward_ledger_entries']['Insert']>;
      };
    };
  };
}
