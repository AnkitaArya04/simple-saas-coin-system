import prisma, { getCurrentUser } from "@/lib/db";
import { NextResponse } from "next/server";

const COINS_TO_USE = 1;

export async function POST() {
  try {
    const user = await getCurrentUser();
    if(user.coins < COINS_TO_USE) {
      return NextResponse.json(
        { error: 'Not enough coins' },
        { status: 400 }
      );
    }


    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { coins: { decrement: COINS_TO_USE }}
      }),
      prisma.coinUsage.create({
        data: {
          userId: user.id,
          coinsUsed: COINS_TO_USE
        }
      })
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    return NextResponse.json({
      success: true,
      remainingCoins: updatedUser?.coins || 0,
    });
    
  } catch(error) {
    console.error('Error using coins:', error);
    return NextResponse.json(
      { error: 'Error using coins' },
      { status: 500 }
    );
  }
}