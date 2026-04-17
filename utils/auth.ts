import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  approved: boolean;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  return data as UserProfile;
}

export async function isUserApproved(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.approved ?? false;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === 'admin';
}

export async function getCurrentUserWithProfile(): Promise<{ user: User | null; profile: UserProfile | null }> {
  const user = await getCurrentUser();
  if (!user) return { user: null, profile: null };
  
  const profile = await getUserProfile(user.id);
  return { user, profile };
}

