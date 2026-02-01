import { createClient } from '@supabase/supabase-js';
import { Role, Region, Cluster } from '../types';

const supabaseUrl = 'https://ggywdwaaguwfgqcvbjqb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneXdkd2FhZ3V3ZmdxY3ZianFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODE0OTQsImV4cCI6MjA3ODI1NzQ5NH0.UzWY-iK9CS9DMFBTfZO1fVdxKVqyBoRq0Wgr-tBUt1c';

interface Database {
  public: {
    Tables: {
      team_members: {
        Row: {
          msisdn: string;
          created_at: string;
          full_name: string;
          role: Role;
          region: Region;
          cluster: Cluster;
          momo_number: string;
        };
        Insert: {
          msisdn: string;
          full_name: string;
          role: Role;
          region: Region;
          cluster: Cluster;
          momo_number: string;
        };
        Update: Partial<{
          full_name: string;
          role: Role;
          region: Region;
          cluster: Cluster;
          momo_number: string;
        }>;
      };
      rgm_submissions: {
        Row: {
          id: string;
          created_at: string;
          team_member_msisdn: string;
          team_member_name: string;
          agent_name: string;
          agent_msisdn: string;
          transaction_id: string;
          submission_date: string;
          region: Region;
        };
        Insert: {
          team_member_msisdn: string;
          team_member_name: string;
          agent_name: string;
          agent_msisdn: string;
          transaction_id: string;
          submission_date: string;
          region: Region;
        };
        Update: Partial<{
          agent_name: string;
          agent_msisdn: string;
          transaction_id: string;
        }>;
      };
      mau_submissions: {
        Row: {
          id: string;
          created_at: string;
          team_member_msisdn: string;
          team_member_name: string;
          agent_name: string;
          agent_msisdn: string;
          transaction_id: string;
          submission_date: string;
          region: Region;
        };
        Insert: {
          team_member_msisdn: string;
          team_member_name: string;
          agent_name: string;
          agent_msisdn: string;
          transaction_id: string;
          submission_date: string;
          region: Region;
        };
        Update: Partial<{
          agent_name: string;
          agent_msisdn: string;
          transaction_id: string;
        }>;
      };
      agent_status: {
        Row: {
          id: number;
          updated_at: string;
          hot_agents: number;
          warm_agents: number;
          cold_agents: number;
        };
        Insert: {
          id?: number;
          hot_agents: number;
          warm_agents: number;
          cold_agents: number;
          updated_at?: string;
        };
        Update: Partial<{
          hot_agents: number;
          warm_agents: number;
          cold_agents: number;
          updated_at?: string;
        }>;
      };
    };
    Enums: {
        role: Role;
        region: Region;
    }
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);