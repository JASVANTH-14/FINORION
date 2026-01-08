import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SanctionEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  country: string;
  risk_level: string;
  sanction_list: string;
  aliases: string[];
  details: Record<string, unknown>;
  created_at: string;
}

export interface ScreeningResult {
  id?: string;
  customer_name: string;
  customer_country: string;
  device_ip: string;
  similarity_score: number;
  country_risk_score: number;
  overall_risk_level: string;
  risk_percentage: number;
  matched_entities: unknown[];
  ai_explanation: string;
  network_analysis: Record<string, unknown>;
  aml_flags: unknown[];
  screening_timestamp: string;
}
