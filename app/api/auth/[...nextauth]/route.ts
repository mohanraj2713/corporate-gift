export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, ctx: any) {
  const NextAuth = (await import('next-auth')).default;
  const { authOptions } = await import('@/lib/auth');
  const handler = NextAuth(authOptions);
  return handler(req as any, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  const NextAuth = (await import('next-auth')).default;
  const { authOptions } = await import('@/lib/auth');
  const handler = NextAuth(authOptions);
  return handler(req as any, ctx);
}
