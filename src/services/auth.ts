import { User } from '../types';

const AUTH_STORAGE_KEY = 'rr_auth_user_session';

export const GOOGLE_CLIENT_ID = '215745218957-7s1reqo73qq8m181hh5rq1sbanajrrul.apps.googleusercontent.com';

export const ADMIN_EMAILS = [
  'seree999@gmail.com',
  '674295023@parichat.skru.ac.th'
];

export const DEFAULT_ADMIN_USER: User = {
  id: 'u-admin-seree',
  email: 'seree999@gmail.com',
  name: 'อาจารย์เสรี ชะนะ (ผู้ดูแลระบบ)',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  role: 'ADMIN'
};

export const SKRU_ADMIN_USER: User = {
  id: 'u-admin-skru',
  email: '674295023@parichat.skru.ac.th',
  name: 'ผู้ดูแลระบบ (SKRU)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  role: 'ADMIN'
};

export const AuthService = {
  loginWithGoogle(data: { email: string; name?: string; picture?: string; credential?: string }): Promise<User> {
    if (data.credential) {
      return this.loginWithGoogleCredential(data.credential);
    }
    return this.directLogin(data.email, data.name, data.picture);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null; // REQUIRE LOGIN: Do not auto-login!
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  decodeGoogleCredential(credential: string): { email: string; name?: string; picture?: string; sub?: string } {
    try {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding Google JWT credential:', e);
      throw new Error('ไม่สามารถถอดรหัส Google Token ได้');
    }
  },

  async loginWithGoogleCredential(credential: string): Promise<User> {
    const payload = this.decodeGoogleCredential(credential);
    const emailLower = (payload.email || '').toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(emailLower);

    const user: User = {
      id: `u-${payload.sub || emailLower.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture,
      role: isAdmin ? 'ADMIN' : 'TENANT'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    // Also sync to Cloudflare D1 via Pages Function
    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
    } catch (e) {
      console.warn('API sync warning:', e);
    }

    return user;
  },

  async directLogin(email: string, name?: string, picture?: string): Promise<User> {
    const emailLower = email.toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(emailLower);

    const user: User = {
      id: `u-${emailLower.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name: name || (emailLower === 'seree999@gmail.com' ? 'อาจารย์เสรี ชะนะ' : email.split('@')[0]),
      avatarUrl: picture || (isAdmin ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' : undefined),
      role: isAdmin ? 'ADMIN' : 'TENANT'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: user.name, picture: user.avatarUrl })
      });
    } catch (e) {
      console.warn('API sync warning:', e);
    }

    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Also disable Google One Tap auto-select
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  },

  isAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || ADMIN_EMAILS.includes(user.email.toLowerCase());
  }
};
