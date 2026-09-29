import { User } from '../types';

const AUTH_STORAGE_KEY = 'rr_auth_user_v1';

export const DEFAULT_ADMIN_USER: User = {
  id: 'u-admin-seree',
  email: 'seree999@gmail.com',
  name: 'อาจารย์เสรี ชะนะ',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  role: 'ADMIN'
};

export const AuthService = {
  getCurrentUser(): User {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      // Default to Seree (Admin) as requested
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_USER));
      return DEFAULT_ADMIN_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ADMIN_USER;
    }
  },

  async loginWithGoogle(data: { email: string; name?: string; picture?: string; credential?: string }): Promise<User> {
    const isAdmin = data.email.toLowerCase() === 'seree999@gmail.com';
    const user: User = {
      id: `u-${data.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: data.email,
      name: data.name || (isAdmin ? 'อาจารย์เสรี ชะนะ (ผู้ดูแลระบบ)' : data.email.split('@')[0]),
      avatarUrl: data.picture || (isAdmin ? DEFAULT_ADMIN_USER.avatarUrl : undefined),
      role: isAdmin ? 'ADMIN' : 'TENANT'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    // Also notify edge API endpoint if available on Cloudflare Pages
    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      // Offline / Local fallback works via localStorage
    }

    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  isAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || user.email.toLowerCase() === 'seree999@gmail.com';
  }
};
