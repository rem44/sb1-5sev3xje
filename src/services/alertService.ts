// src/services/alertService.ts
import { supabase, isSupabaseConfigured } from './supabase';

export interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'error';
  read: boolean;
  claimId?: string;
  claimNumber?: string;
  createdAt: Date;
}

// Mock alerts for demo
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    message: 'New claim CLM-2025-0127 has been created',
    type: 'info',
    read: false,
    claimId: '1',
    claimNumber: 'CLM-2025-0127',
    createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    id: '2',
    message: 'Claim CLM-2025-0143 requires attention - color variation issue',
    type: 'warning',
    read: false,
    claimId: '2',
    claimNumber: 'CLM-2025-0143',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  },
  {
    id: '3',
    message: 'Claim CLM-2025-0156 has been updated with new documents',
    type: 'info',
    read: true,
    claimId: '3',
    claimNumber: 'CLM-2025-0156',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
];

// Helper functions for mock data
const getMockAlerts = (): Alert[] => {
  const storedAlerts = localStorage.getItem('mock_alerts');
  if (storedAlerts) {
    return JSON.parse(storedAlerts);
  }
  localStorage.setItem('mock_alerts', JSON.stringify(MOCK_ALERTS));
  return MOCK_ALERTS;
};

const saveMockAlerts = (alerts: Alert[]): void => {
  localStorage.setItem('mock_alerts', JSON.stringify(alerts));
};

export const alertService = {
  async fetchAlerts(): Promise<Alert[]> {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured()) {
      return getMockAlerts();
    }

    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        claim:claims(claim_number)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(alert => ({
      id: alert.id,
      message: alert.message,
      type: alert.type,
      read: alert.read,
      claimId: alert.claim_id,
      claimNumber: alert.claim?.claim_number,
      createdAt: new Date(alert.created_at)
    }));
  },

  async markAsRead(id: string): Promise<void> {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured()) {
      const alerts = getMockAlerts();
      const alertIndex = alerts.findIndex(alert => alert.id === id);
      if (alertIndex >= 0) {
        alerts[alertIndex].read = true;
        saveMockAlerts(alerts);
      }
      return;
    }

    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async markAllAsRead(): Promise<void> {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured()) {
      const alerts = getMockAlerts();
      const updatedAlerts = alerts.map(alert => ({ ...alert, read: true }));
      saveMockAlerts(updatedAlerts);
      return;
    }

    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error(error.message);
    }
  },

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<string> {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured()) {
      const alerts = getMockAlerts();
      const newAlert: Alert = {
        id: Date.now().toString(),
        ...alert,
        createdAt: new Date()
      };
      alerts.unshift(newAlert);
      saveMockAlerts(alerts);
      return newAlert.id;
    }

    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: userId,
        claim_id: alert.claimId,
        message: alert.message,
        type: alert.type,
        read: alert.read
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.id;
  }
};
