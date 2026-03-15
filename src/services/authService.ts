import { supabase } from '../lib/supabase';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthSession {
  userId: string;
  username: string;
  isAdmin: boolean;
}

const RATE_LIMIT_KEY = 'auth_rate_limit';
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;

class AuthService {
  public async initialize(): Promise<void> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'admin')
        .maybeSingle();

      if (!users) {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-init`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    const clientIp = await this.getClientIp();
    const userAgent = navigator.userAgent;
    const normalizedUsername = credentials.username.toLowerCase();

    if (this.isRateLimited()) {
      await this.logAuditEvent({
        username: normalizedUsername,
        authStatus: 'failure',
        ipAddress: clientIp,
        userAgent,
        isAdminAttempt: normalizedUsername === 'admin',
        failureReason: 'rate_limited',
      });
      throw new Error('Too many login attempts. Please try again later.');
    }

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: normalizedUsername,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.incrementRateLimitCounter();

        const failureReason = data.reason || 'invalid_username';
        await this.logAuditEvent({
          username: normalizedUsername,
          authStatus: 'failure',
          ipAddress: clientIp,
          userAgent,
          isAdminAttempt: normalizedUsername === 'admin',
          failureReason,
        });

        throw new Error('Authentication failed. Please check your credentials.');
      }

      this.clearRateLimitCounter();

      const session: AuthSession = {
        userId: data.userId,
        username: data.username,
        isAdmin: data.isAdmin,
      };

      localStorage.setItem('auth_session', JSON.stringify(session));
      localStorage.setItem('auth_timestamp', Date.now().toString());

      await this.logAuditEvent({
        username: normalizedUsername,
        authStatus: 'success',
        ipAddress: clientIp,
        userAgent,
        isAdminAttempt: data.isAdmin,
      });

      return session;
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate_limited')) {
        throw error;
      }
      await this.logAuditEvent({
        username: normalizedUsername,
        authStatus: 'failure',
        ipAddress: clientIp,
        userAgent,
        isAdminAttempt: normalizedUsername === 'admin',
        failureReason: 'system_error',
      });
      throw new Error('Authentication failed. Please check your credentials.');
    }
  }

  public async logout(): Promise<void> {
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_timestamp');
  }

  public getSession(): AuthSession | null {
    const sessionStr = localStorage.getItem('auth_session');
    if (!sessionStr) return null;

    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  public isAdmin(): boolean {
    const session = this.getSession();
    return session?.isAdmin ?? false;
  }

  private isRateLimited(): boolean {
    const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
    if (!rateLimitData) return false;

    const { count, timestamp } = JSON.parse(rateLimitData);
    const now = Date.now();

    if (now - timestamp > RATE_LIMIT_WINDOW) {
      localStorage.removeItem(RATE_LIMIT_KEY);
      return false;
    }

    return count >= RATE_LIMIT_ATTEMPTS;
  }

  private incrementRateLimitCounter(): void {
    const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();

    if (!rateLimitData) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, timestamp: now }));
      return;
    }

    const { count, timestamp } = JSON.parse(rateLimitData);

    if (now - timestamp > RATE_LIMIT_WINDOW) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, timestamp: now }));
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: count + 1, timestamp }));
    }
  }

  private clearRateLimitCounter(): void {
    localStorage.removeItem(RATE_LIMIT_KEY);
  }

  private async getClientIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        mode: 'cors',
      });
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async logAuditEvent(event: {
    username: string;
    authStatus: 'success' | 'failure';
    ipAddress: string;
    userAgent: string;
    isAdminAttempt: boolean;
    failureReason?: string;
  }): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        username: event.username,
        auth_status: event.authStatus,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        is_admin_attempt: event.isAdminAttempt,
        failure_reason: event.failureReason || null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }
}

export const authService = new AuthService();
