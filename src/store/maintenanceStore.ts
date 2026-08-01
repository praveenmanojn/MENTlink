import { create } from 'zustand';
import { supabase } from '../services/supabase/client';

interface MaintenanceState {
  isMaintenanceMode: boolean;
  loading: boolean;
  fetchMaintenanceStatus: () => Promise<void>;
  setMaintenanceMode: (enabled: boolean) => Promise<void>;
  initRealtimeListener: () => () => void;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  isMaintenanceMode: false,
  loading: true,

  fetchMaintenanceStatus: async () => {
    if (!supabase) {
      set({ loading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (!error && data?.value) {
        const enabled = Boolean(data.value.enabled);
        set({ isMaintenanceMode: enabled, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.warn('Error fetching maintenance status:', err);
      set({ loading: false });
    }
  },

  setMaintenanceMode: async (enabled: boolean) => {
    // Optimistic update
    set({ isMaintenanceMode: enabled });

    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'maintenance_mode',
          value: { enabled },
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('Failed to update maintenance mode in Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error updating maintenance mode:', err);
    }
  },

  initRealtimeListener: () => {
    // Fetch initial status
    get().fetchMaintenanceStatus();

    if (!supabase) return () => {};

    const channelId = `maintenance-listen-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.maintenance_mode',
        },
        (payload: any) => {
          if (payload.new?.value) {
            const enabled = Boolean(payload.new.value.enabled);
            set({ isMaintenanceMode: enabled });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
