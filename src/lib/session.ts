import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-min-32-characters'
);

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp?: number;
  [key: string]: unknown; // allow dynamic key-value
}

// Buat session token
export async function createSession(data: Omit<SessionData, 'exp'>) {
  const token = await new SignJWT(data as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(SECRET_KEY);

  return token;
}

// Verify dan decode session token
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionData;
  } catch (error) {
    return null;
  }
}

// Set nilai berdasarkan key ke dalam session (returns token baru)
export async function setSession(token: string, key: string, value: unknown): Promise<string | null> {
  const session = await verifySession(token);
  if (!session) return null;

  const { exp, ...rest } = session;
  const updated = { ...rest, [key]: value };

  return await createSession(updated as Omit<SessionData, 'exp'>);
}

// Get nilai berdasarkan key dari session
export async function getSession<T = unknown>(token: string, key: string): Promise<T | null> {
  const session = await verifySession(token);
  if (!session) return null;

  return (session[key] as T) ?? null;
}