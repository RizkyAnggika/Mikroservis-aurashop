// src/lib/auth.ts
import { User, AuthState } from "@/lib/types";
import { mockUsers } from "@/data/mockData";

const AUTH_STORAGE_KEY = "teashop_auth";
const CLIENT_ID_KEY = "teashop_client_id";

/**
 * ✅ Generate atau ambil clientId unik untuk setiap browser/user
 */
export function getClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    // fallback kalau localStorage error (misal mode private)
    return Math.random().toString(36).slice(2, 10);
  }
}

/**
 * ✅ AuthService sederhana berbasis localStorage
 * Mendukung multi-role: admin, kasir, staf
 */
export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = { user: null, isAuthenticated: false };

  static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  constructor() {
    this.loadAuthState();
  }

  // ---------- State Persistence ----------
  private loadAuthState(): void {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        this.authState = JSON.parse(stored);
      } catch {
        this.authState = { user: null, isAuthenticated: false };
      }
    }
  }

  private saveAuthState(): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.authState));
  }

  // ---------- Auth Logic ----------
  login(username: string, password: string): boolean {
    const user = mockUsers.find((u) => u.username === username);
    if (user && password === "password123") {
      this.authState = { user, isAuthenticated: true };
      this.saveAuthState();
      return true;
    }
    return false;
  }

  logout(): void {
    this.authState = { user: null, isAuthenticated: false };
    this.saveAuthState();
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  hasRole(role: User["role"]): boolean {
    return this.authState.user?.role === role;
  }

  // ---------- Role Permissions ----------
  canManageMenu(): boolean {
    return this.hasRole("admin");
  }

  canProcessOrders(): boolean {
    return this.hasRole("admin") || this.hasRole("kasir");
  }

  canViewInventory(): boolean {
    return this.hasRole("admin") || this.hasRole("staf");
  }

  // ---------- Client Identifier ----------
  getClientId(): string {
    return getClientId();
  }
}

// ✅ Ekspor instance tunggal
export const authService = AuthService.getInstance();
