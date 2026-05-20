'use client';
import { create } from 'zustand';
import api from '@/lib/api';
import { Employee, EmployeeFilters, Pagination } from '@/types';

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  pagination: Pagination;
  filters: EmployeeFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchEmployees: (filters?: Partial<EmployeeFilters>) => Promise<void>;
  fetchEmployee: (id: string) => Promise<void>;
  createEmployee: (data: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  uploadImage: (id: string, file: File) => Promise<string>;
  setFilters: (filters: Partial<EmployeeFilters>) => void;
  setPage: (page: number) => void;
  clearSelected: () => void;
}

const defaultFilters: EmployeeFilters = {
  search: '', role: '', status: '', department: '', page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc',
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  selectedEmployee: null,
  pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  filters: defaultFilters,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchEmployees: async (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ isLoading: true, error: null, filters });
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await api.get('/employees', { params });
      set({ employees: res.data.data.employees, pagination: res.data.data.pagination, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch employees' });
    }
  },

  fetchEmployee: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/employees/${id}`);
      set({ selectedEmployee: res.data.data.employee, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch employee' });
    }
  },

  createEmployee: async (data) => {
    set({ isSubmitting: true });
    try {
      const res = await api.post('/employees', data);
      const newEmp = res.data.data.employee;
      set((state) => ({ employees: [newEmp, ...state.employees], isSubmitting: false }));
      return newEmp;
    } catch (err: any) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  updateEmployee: async (id, data) => {
    set({ isSubmitting: true });
    try {
      const res = await api.put(`/employees/${id}`, data);
      const updated = res.data.data.employee;
      set((state) => ({
        employees: state.employees.map((e) => (e._id === id ? updated : e)),
        selectedEmployee: updated,
        isSubmitting: false,
      }));
    } catch (err: any) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  deleteEmployee: async (id) => {
    set({ isSubmitting: true });
    try {
      await api.delete(`/employees/${id}`);
      set((state) => ({ employees: state.employees.filter((e) => e._id !== id), isSubmitting: false }));
    } catch (err: any) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post(`/employees/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    const url = res.data.data.profileImage;
    set((state) => ({
      employees: state.employees.map((e) => (e._id === id ? { ...e, profileImage: url } : e)),
      selectedEmployee: state.selectedEmployee?._id === id ? { ...state.selectedEmployee, profileImage: url } : state.selectedEmployee,
    }));
    return url;
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters, page: 1 } }));
  },

  setPage: (page) => set((state) => ({ filters: { ...state.filters, page } })),
  clearSelected: () => set({ selectedEmployee: null }),
}));
