import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BetaGroup {
  id: string;
  name: string;
  created_at: string;
}

export interface BetaGroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface BetaGroupPendingMember {
  group_id: string;
  phone: string;
  name: string | null;
  added_at: string;
}

export async function getBetaGroups(): Promise<BetaGroup[]> {
  const { data, error } = await supabase
    .from('beta_groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching beta groups:', error);
    return [];
  }

  return data || [];
}

export async function getBetaGroupMembers(groupId: string): Promise<BetaGroupMember[]> {
  const { data, error } = await supabase
    .from('beta_group_members')
    .select(`
      *,
      profile:profiles (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching beta group members:', error);
    return [];
  }

  return data || [];
}

export async function getBetaGroupPendingMembers(groupId: string): Promise<BetaGroupPendingMember[]> {
  const { data, error } = await supabase
    .from('beta_group_pending_members')
    .select('*')
    .eq('group_id', groupId)
    .order('added_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending members:', error);
    return [];
  }

  return data || [];
}
