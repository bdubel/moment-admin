import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
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

export interface User {
  id: string;
  first_name: string;
  last_name: string | null;
  created_at: string;
  avatar_url: string | null;
}

export interface UserWithStats extends User {
  post_count: number;
  friend_count: number;
  group_count: number;
}

export interface Post {
  id: string;
  user_id: string;
  caption: string | null;
  created_at: string;
  duration_seconds: number;
  is_private: boolean;
  thread_id: string | null;
}

export interface Friend {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string | null;
  created_at: string;
  member_count: number;
}

export interface WeeklyMetrics {
  week_start: string;
  total_posts: number;
  total_hours: number;
  unique_users: number;
}

export interface UserWeeklyMetrics {
  user_id: string;
  user_name: string;
  week_start: string;
  posts: number;
  hours: number;
}

// Beta Groups functions
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

// Users functions (calls API routes)
export async function getUsers(): Promise<UserWithStats[]> {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUserDetail(userId: string): Promise<{
  posts: Post[];
  friends: Friend[];
  groups: Group[];
}> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user detail');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return { posts: [], friends: [], groups: [] };
  }
}

// Metrics functions (calls API routes)
export async function getMetrics(): Promise<{
  weekly: WeeklyMetrics[];
  users: UserWeeklyMetrics[];
}> {
  try {
    const response = await fetch('/api/metrics');
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return { weekly: [], users: [] };
  }
}
