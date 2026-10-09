import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCT_CATEGORIES } from '../config';

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
export type ProductStatus = 'active' | 'used' | 'disposed';

export interface Product {
  id: string;
  user_id: string;
  product_name: string;
  category: ProductCategory;
  brand: string;
  expiry_date: string; // ISO date string
  purchase_date?: string;
  quantity?: number;
  batch_number?: string;
  image_url?: string;
  notes?: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  reminder_intervals: number[]; // days before expiry
}

export interface Notification {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  title: string;
  message: string;
  scheduled_at: string;
  sent_at?: string;
  read_at?: string;
  notification_type: 'reminder' | 'expired' | 'system';
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Products
  products: Product[];
  notifications: Notification[];

  // UI
  sidebarOpen: boolean;
  currentPage: string;
  theme: 'light' | 'dark';
  language: 'en' | 'ta';

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'en' | 'ta') => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      products: [],
      notifications: [],
      sidebarOpen: true,
      currentPage: 'dashboard',
      theme: 'light',
      language: 'en',

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
      setNotifications: (notifications) => set({ notifications }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read_at: n.read_at || new Date().toISOString(),
          })),
        })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          products: [],
          notifications: [],
          currentPage: 'dashboard',
        }),
    }),
    {
      name: 'expiry-guard-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        language: state.language,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
