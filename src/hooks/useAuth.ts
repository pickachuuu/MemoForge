import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// ============================================
// Types
// ============================================

export interface UserProfile {
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
}

// ============================================
// Query Keys
// ============================================

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// ============================================
// API Functions
// ============================================

async function fetchUserProfile(): Promise<UserProfile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const metadata = session.user.user_metadata ?? {};
  const fallbackProfile = {
    full_name: typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : null,
    email: session.user.email ?? null,
    avatar_url: typeof metadata.avatar_url === 'string'
      ? metadata.avatar_url
      : typeof metadata.picture === 'string'
        ? metadata.picture
        : null,
  };

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Profile fetch error:', error.message);
    return fallbackProfile;
  }

  return {
    full_name: data.full_name ?? fallbackProfile.full_name,
    email: data.email ?? fallbackProfile.email,
    avatar_url: data.avatar_url ?? fallbackProfile.avatar_url,
  };
}

// ============================================
// Query Hooks
// ============================================

export function useUserProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes - profile rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
