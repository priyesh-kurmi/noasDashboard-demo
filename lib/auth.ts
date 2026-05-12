// DEMO MODE — authentication uses hardcoded demo credentials only, no database required.
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Fixed secret baked in — no environment variable needed for demo
const DEMO_SECRET = new TextEncoder().encode('demo-mode-fixed-secret-business-dashboard-2024');

const DEMO_EMAIL = 'demo@dashboard.com';
const DEMO_PASSWORD = 'demo1234';

export async function login(email: string, password: string) {
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return { success: false, error: 'Invalid credentials' };
  }

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(DEMO_SECRET);

  (await cookies()).set('auth-token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return { success: true };
}

export async function logout() {
  (await cookies()).delete('auth-token');
}

export async function getSession() {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, DEMO_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function changePassword(_currentPassword: string, _newPassword: string) {
  // Demo mode — password changes are not persisted
  return { success: true };
}
