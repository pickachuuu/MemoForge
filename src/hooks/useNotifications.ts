'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export type NotificationDismissal = {
  notification_key: string;
  dismissed_on: string | null;
};

export const notificationKeys = {
  all: ['notifications'] as const,
  dismissals: () => [...notificationKeys.all, 'dismissals'] as const,
};

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

async function fetchNotificationDismissals(): Promise<NotificationDismissal[]> {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from('notification_dismissals')
    .select('notification_key, dismissed_on')
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error fetching notification dismissals:', error);
    throw error;
  }

  return (data || []) as NotificationDismissal[];
}

async function dismissNotifications(keys: string[]) {
  const session = await getSession();
  if (!session?.user?.id || keys.length === 0) return;

  const todayKey = new Date().toISOString().split('T')[0];
  const payload = keys.map((key) => ({
    user_id: session.user.id,
    notification_key: key,
    dismissed_on: todayKey,
  }));

  const { error } = await supabase
    .from('notification_dismissals')
    .upsert(payload, { onConflict: 'user_id,notification_key' });

  if (error) {
    console.error('Error dismissing notifications:', error);
    throw error;
  }
}

export function useNotificationDismissals() {
  return useQuery({
    queryKey: notificationKeys.dismissals(),
    queryFn: fetchNotificationDismissals,
    staleTime: 30 * 1000,
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.dismissals() });
    },
  });
}
