import { supabase } from '../lib/supabase';
import type {
  User,
  Session,
  LoginCredentials,
  RegisterCredentials,
  ApiResponse,
} from '../types';

const SESSION_TOKEN_KEY = 'smartlink_session_token';

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${salt}:${hashHex}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hash === hashHex;
}

function generateSessionToken(): string {
  return crypto.randomUUID();
}

function getSessionExpiry(): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry.toISOString();
}

export async function register(
  credentials: RegisterCredentials
): Promise<ApiResponse<{ user: User; session: Session }>> {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', credentials.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: { code: 'EMAIL_EXISTS', message: '이미 사용 중인 이메일입니다.' },
      };
    }

    const passwordHash = await hashPassword(credentials.password);

    const isLocalEnv = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const isAdminEmail = credentials.email === 'pond75@naver.com';
    const isApproved = isLocalEnv && isAdminEmail;
    const role = isApproved ? 'admin' : 'user';

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: credentials.email,
        password_hash: passwordHash,
        name: credentials.name,
        role,
        email_verified: false,
        is_active: isApproved,
      })
      .select()
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: { code: 'REGISTRATION_FAILED', message: '회원가입에 실패했습니다.' },
      };
    }

    if (!isApproved) {
      return {
        success: false,
        error: { code: 'PENDING_APPROVAL', message: '회원가입이 완료되었습니다. 관리자 승인 후 사용할 수 있습니다.' },
      };
    }

    const sessionToken = generateSessionToken();
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: getSessionExpiry(),
        user_agent: navigator.userAgent,
      })
      .select()
      .single();

    if (sessionError || !session) {
      return {
        success: false,
        error: { code: 'SESSION_CREATION_FAILED', message: '세션 생성에 실패했습니다.' },
      };
    }

    localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);

    return {
      success: true,
      data: {
        user: mapUserFromDb(user),
        session: mapSessionFromDb(session),
      },
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<{ user: User; session: Session }>> {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      };
    }

    const isValid = await verifyPassword(credentials.password, user.password_hash);
    if (!isValid) {
      return {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      };
    }

    if (!user.is_active) {
      return {
        success: false,
        error: { code: 'PENDING_APPROVAL', message: '아직 관리자 승인 처리가 안되었습니다.' },
      };
    }

    const isLocalEnv = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const isAdminEmail = credentials.email === 'pond75@naver.com';
    const shouldBeAdmin = isLocalEnv && isAdminEmail && user.role !== 'admin';

    const updateData: Record<string, string> = { last_login_at: new Date().toISOString() };
    if (shouldBeAdmin) {
      updateData.role = 'admin';
      user.role = 'admin';
    }

    await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    const sessionToken = generateSessionToken();
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: getSessionExpiry(),
        user_agent: navigator.userAgent,
      })
      .select()
      .single();

    if (sessionError || !session) {
      return {
        success: false,
        error: { code: 'SESSION_CREATION_FAILED', message: '세션 생성에 실패했습니다.' },
      };
    }

    localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);

    return {
      success: true,
      data: {
        user: mapUserFromDb(user),
        session: mapSessionFromDb(session),
      },
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function logout(): Promise<ApiResponse<void>> {
  try {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      await supabase.from('sessions').delete().eq('token', token);
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: { code: 'LOGOUT_FAILED', message: '로그아웃에 실패했습니다.' },
    };
  }
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  try {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      return {
        success: false,
        error: { code: 'NO_SESSION', message: '로그인이 필요합니다.' },
      };
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('*, users(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session || !session.users) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      return {
        success: false,
        error: { code: 'INVALID_SESSION', message: '세션이 만료되었습니다.' },
      };
    }

    return {
      success: true,
      data: mapUserFromDb(session.users),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function validateSession(): Promise<ApiResponse<{ user: User; session: Session }>> {
  try {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      return {
        success: false,
        error: { code: 'NO_SESSION', message: '로그인이 필요합니다.' },
      };
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('*, users(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session || !session.users) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      return {
        success: false,
        error: { code: 'INVALID_SESSION', message: '세션이 만료되었습니다.' },
      };
    }

    return {
      success: true,
      data: {
        user: mapUserFromDb(session.users),
        session: mapSessionFromDb(session),
      },
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

interface DbUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}

interface DbSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  user_agent?: string;
  ip_address?: string;
}

function mapUserFromDb(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    emailVerified: dbUser.email_verified,
    profileImageUrl: dbUser.profile_image_url,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    lastLoginAt: dbUser.last_login_at,
    isActive: dbUser.is_active,
  };
}

function mapSessionFromDb(dbSession: DbSession): Session {
  return {
    id: dbSession.id,
    userId: dbSession.user_id,
    token: dbSession.token,
    expiresAt: dbSession.expires_at,
    createdAt: dbSession.created_at,
    userAgent: dbSession.user_agent,
    ipAddress: dbSession.ip_address,
  };
}
