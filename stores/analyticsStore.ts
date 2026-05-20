'use client';
import { create } from 'zustand';
import api from '@/lib/api';
import { AnalyticsOverview, DepartmentStat, GrowthStat, RoleStat, ActivityLog } from '@/types';

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  departments: DepartmentStat[];
  growth: GrowthStat[];
  roles: RoleStat[];
  activity: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchDepartments: () => Promise<void>;
  fetchGrowth: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchActivity: (limit?: number) => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overview: null,
  departments: [],
  growth: [],
  roles: [],
  activity: [],
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    try {
      const res = await api.get('/analytics/overview');
      set({ overview: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch overview' });
    }
  },

  fetchDepartments: async () => {
    try {
      const res = await api.get('/analytics/departments');
      set({ departments: res.data.data.departments });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch department stats' });
    }
  },

  fetchGrowth: async () => {
    try {
      const res = await api.get('/analytics/growth');
      set({ growth: res.data.data.growth });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch growth stats' });
    }
  },

  fetchRoles: async () => {
    try {
      const res = await api.get('/analytics/roles');
      set({ roles: res.data.data.roles });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch role stats' });
    }
  },

  fetchActivity: async (limit = 10) => {
    try {
      const res = await api.get('/analytics/activity', { params: { limit } });
      set({ activity: res.data.data.activities });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch activity' });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [overview, departments, growth, roles, activity] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/departments'),
        api.get('/analytics/growth'),
        api.get('/analytics/roles'),
        api.get('/analytics/activity', { params: { limit: 10 } }),
      ]);
      set({
        overview: overview.data.data,
        departments: departments.data.data.departments,
        growth: growth.data.data.growth,
        roles: roles.data.data.roles,
        activity: activity.data.data.activities,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch analytics' });
    }
  },
}));
