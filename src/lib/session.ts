import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-min-32-characters'
);

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  exp?: number;
}

// Buat session token
export async function createSession(data: Omit<SessionData, 'exp'>) {
  const token = await new SignJWT(data as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h') // Session berlaku 24 jam
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