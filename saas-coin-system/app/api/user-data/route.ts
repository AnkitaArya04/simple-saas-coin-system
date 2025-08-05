import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ coins: user.coins });
  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { error: 'Error getting user data' },
      { status: 500 }
    );
  }
}