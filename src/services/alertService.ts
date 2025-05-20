// src/services/alertService.ts
import { supabase } from './supabase';

export interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'error';
  read: boolean;
  claimId?: string;
  claimNumber?: string;
  createdAt: Date;
}

export const alertService = {
  async fetchAlerts(): Promise<Alert[]> {
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
    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async markAllAsRead(): Promise<void> {
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
