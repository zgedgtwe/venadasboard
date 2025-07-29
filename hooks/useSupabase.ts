import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry } from '../types';

// Helper function to convert database row to app format
const convertDatabaseRow = (table: string, row: any): any => {
  switch (table) {
    case 'clients':
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        since: row.since,
        instagram: row.instagram,
        status: row.status,
        lastContact: row.last_contact
      };
    case 'projects':
      return {
        id: row.id,
        projectName: row.project_name,
        clientName: row.client_name,
        clientId: row.client_id,
        projectType: row.project_type,
        packageName: row.package_name,
        packageId: row.package_id,
        addOns: row.addons || [],
        date: row.date,
        deadlineDate: row.deadline_date,
        location: row.location,
        progress: row.progress,
        status: row.status,
        totalCost: row.total_cost,
        amountPaid: row.amount_paid,
        paymentStatus: row.payment_status,
        team: row.team || [],
        notes: row.notes,
        accommodation: row.accommodation,
        driveLink: row.drive_link,
        startTime: row.start_time,
        endTime: row.end_time
      };
    case 'team_members':
      return {
        id: row.id,
        name: row.name,
        role: row.role,
        email: row.email,
        phone: row.phone,
        standardFee: row.standard_fee,
        rewardBalance: row.reward_balance
      };
    case 'transactions':
      return {
        id: row.id,
        date: row.date,
        description: row.description,
        amount: row.amount,
        type: row.type,
        projectId: row.project_id,
        category: row.category,
        method: row.method,
        pocketId: row.pocket_id
      };
    case 'financial_pockets':
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        type: row.type,
        amount: row.amount,
        goalAmount: row.goal_amount,
        lockEndDate: row.lock_end_date,
        members: row.members
      };
    case 'team_project_payments':
      return {
        id: row.id,
        projectId: row.project_id,
        teamMemberName: row.team_member_name,
        teamMemberId: row.team_member_id,
        date: row.date,
        status: row.status,
        fee: row.fee,
        reward: row.reward
      };
    case 'team_payment_records':
      return {
        id: row.id,
        recordNumber: row.record_number,
        teamMemberId: row.team_member_id,
        date: row.date,
        projectPaymentIds: row.project_payment_ids,
        totalAmount: row.total_amount
      };
    case 'reward_ledger_entries':
      return {
        id: row.id,
        teamMemberId: row.team_member_id,
        date: row.date,
        description: row.description,
        amount: row.amount,
        projectId: row.project_id
      };
    case 'profiles':
      return {
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        companyName: row.company_name,
        website: row.website,
        address: row.address,
        bankAccount: row.bank_account,
        bio: row.bio,
        incomeCategories: row.income_categories || [],
        expenseCategories: row.expense_categories || [],
        projectTypes: row.project_types || [],
        eventTypes: row.event_types || [],
        notificationSettings: row.notification_settings || {},
        securitySettings: row.security_settings || {}
      };
    default:
      return row;
  }
};

// Helper function to convert app format to database format
const convertToDatabase = (table: string, data: any): any => {
  switch (table) {
    case 'clients':
      return {
        name: data.name,
        email: data.email,
        phone: data.phone,
        since: data.since,
        instagram: data.instagram,
        status: data.status,
        last_contact: data.lastContact
      };
    case 'projects':
      return {
        project_name: data.projectName,
        client_name: data.clientName,
        client_id: data.clientId,
        project_type: data.projectType,
        package_name: data.packageName,
        package_id: data.packageId,
        addons: data.addOns || [],
        date: data.date,
        deadline_date: data.deadlineDate,
        location: data.location,
        progress: data.progress,
        status: data.status,
        total_cost: data.totalCost,
        amount_paid: data.amountPaid,
        payment_status: data.paymentStatus,
        team: data.team || [],
        notes: data.notes,
        accommodation: data.accommodation,
        drive_link: data.driveLink,
        start_time: data.startTime,
        end_time: data.endTime
      };
    case 'team_members':
      return {
        name: data.name,
        role: data.role,
        email: data.email,
        phone: data.phone,
        standard_fee: data.standardFee,
        reward_balance: data.rewardBalance
      };
    case 'transactions':
      return {
        date: data.date,
        description: data.description,
        amount: data.amount,
        type: data.type,
        project_id: data.projectId,
        category: data.category,
        method: data.method,
        pocket_id: data.pocketId
      };
    case 'financial_pockets':
      return {
        name: data.name,
        description: data.description,
        icon: data.icon,
        type: data.type,
        amount: data.amount,
        goal_amount: data.goalAmount,
        lock_end_date: data.lockEndDate,
        members: data.members
      };
    case 'team_project_payments':
      return {
        project_id: data.projectId,
        team_member_name: data.teamMemberName,
        team_member_id: data.teamMemberId,
        date: data.date,
        status: data.status,
        fee: data.fee,
        reward: data.reward
      };
    case 'team_payment_records':
      return {
        record_number: data.recordNumber,
        team_member_id: data.teamMemberId,
        date: data.date,
        project_payment_ids: data.projectPaymentIds,
        total_amount: data.totalAmount
      };
    case 'reward_ledger_entries':
      return {
        team_member_id: data.teamMemberId,
        date: data.date,
        description: data.description,
        amount: data.amount,
        project_id: data.projectId
      };
    case 'profiles':
      return {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName,
        website: data.website,
        address: data.address,
        bank_account: data.bankAccount,
        bio: data.bio,
        income_categories: data.incomeCategories || [],
        expense_categories: data.expenseCategories || [],
        project_types: data.projectTypes || [],
        event_types: data.eventTypes || [],
        notification_settings: data.notificationSettings || {},
        security_settings: data.securitySettings || {}
      };
    case 'leads':
      return {
        name: data.name,
        contact_channel: data.contactChannel,
        location: data.location,
        status: data.status,
        date: data.date,
        notes: data.notes
      };
    default:
      return data;
  }
};

// Generic CRUD hooks
export function useSupabaseData<T>(tableName: string, orderBy?: { column: string; ascending?: boolean }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from(tableName).select('*');

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data: result, error } = await query;

      if (error) throw error;

      const convertedData = result?.map(row => convertDatabaseRow(tableName, row)) || [];
      setData(convertedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItem: Partial<T>) => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const dbData = convertToDatabase(tableName, newItem);
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      const convertedItem = convertDatabaseRow(tableName, result);
      setData(prev => [convertedItem, ...prev]);
      return convertedItem;
    } catch (err) {
      console.error(`Error adding ${tableName}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      const dbData = convertToDatabase(tableName, updates);
      const { data: result, error } = await supabase
        .from(tableName)
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const convertedItem = convertDatabaseRow(tableName, result);
      setData(prev => prev.map(item => (item as any).id === id ? convertedItem : item));
      return convertedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(prev => prev.filter(item => (item as any).id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    addItem,
    updateItem,
    deleteItem
  };
}

// Specific hooks for each entity
export const useClients = () => useSupabaseData<Client>('clients', { column: 'created_at', ascending: false });
export const useProjects = () => useSupabaseData<Project>('projects', { column: 'created_at', ascending: false });
export const useTeamMembers = () => useSupabaseData<TeamMember>('team_members', { column: 'name', ascending: true });
export const useTransactions = () => useSupabaseData<Transaction>('transactions', { column: 'date', ascending: false });
export const usePackages = () => useSupabaseData<Package>('packages', { column: 'name', ascending: true });
export const useAddOns = () => useSupabaseData<AddOn>('addons', { column: 'name', ascending: true });
export const usePockets = () => useSupabaseData<FinancialPocket>('financial_pockets', { column: 'name', ascending: true });
export const useTeamProjectPayments = () => useSupabaseData<TeamProjectPayment>('team_project_payments', { column: 'date', ascending: false });
export const useTeamPaymentRecords = () => useSupabaseData<TeamPaymentRecord>('team_payment_records', { column: 'date', ascending: false });
export const useLeads = () => useSupabaseData<Lead>('leads', { column: 'date', ascending: false });
export const useRewardLedgerEntries = () => useSupabaseData<RewardLedgerEntry>('reward_ledger_entries', { column: 'date', ascending: false });

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it from user metadata
          const defaultProfileData = {
            id: user.id,
            full_name: user.user_metadata?.fullName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: '',
            company_name: user.user_metadata?.companyName || 'My Company',
            website: '',
            address: '',
            bank_account: '',
            bio: '',
            income_categories: ['DP Proyek', 'Pelunasan Proyek', 'Penjualan Album', 'Sewa Alat', 'Lain-lain'],
            expense_categories: ['Gaji Freelancer', 'Hadiah Freelancer', 'Penarikan Hadiah Freelancer', 'Sewa Tempat', 'Transportasi', 'Konsumsi', 'Marketing', 'Sewa Alat', 'Cetak Album', 'Operasional Kantor', 'Transfer Antar Kantong', 'Penutupan Anggaran'],
            project_types: ['Pernikahan', 'Pre-wedding', 'Lamaran', 'Acara Korporat', 'Ulang Tahun'],
            event_types: ['Meeting Klien', 'Survey Lokasi', 'Libur', 'Workshop', 'Lainnya'],
            notification_settings: { newProject: true, paymentConfirmation: true, deadlineReminder: true },
            security_settings: { twoFactorEnabled: false }
          };

          const { data: newProfileData, error: insertError } = await supabase
            .from('profiles')
            .insert([defaultProfileData])
            .select()
            .single();

          if (insertError) throw insertError;
          // Update the returned data with new profile data
            return { data: newProfileData, error: null };
        } else {
          throw error;
        }
      }

      const convertedProfile = convertDatabaseRow('profiles', data);
      setProfile(convertedProfile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Profile fetch error:', errorMsg);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const dbData = convertToDatabase('profiles', updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const convertedProfile = convertDatabaseRow('profiles', data);
      setProfile(convertedProfile);
      return convertedProfile;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Profile update error:', errorMsg);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    updateProfile,
    setProfile,
    loading
  };
};