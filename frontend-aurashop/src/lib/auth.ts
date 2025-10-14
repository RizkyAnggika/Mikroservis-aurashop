import { User, AuthState } from '@/lib/types';
import { mockUsers } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'teashop_auth';

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
  };

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.authState = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  }

  private saveAuthState(): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.authState));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  login(username: string, password: string): boolean {
    // Simple mock authentication
    const user = mockUsers.find(u => u.username === username);
    if (user && password === 'password123') {
      this.authState = {
        user,
        isAuthenticated: true,
      };
      this.saveAuthState();
      return true;
    }
    return false;
  }

  logout(): void {
    this.authState = {
      user: null,
      isAuthenticated: false,
    };
    this.saveAuthState();
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  hasRole(role: User['role']): boolean {
    return this.authState.user?.role === role;
  }

  canManageMenu(): boolean {
    return this.hasRole('admin');
  }

  canProcessOrders(): boolean {
    return this.hasRole('admin') || this.hasRole('kasir');
  }

  canViewInventory(): boolean {
    return this.hasRole('admin') || this.hasRole('staf');
  }
}

export const authService = AuthService.getInstance();