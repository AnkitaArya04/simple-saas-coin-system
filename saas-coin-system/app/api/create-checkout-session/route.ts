import prisma, { getCurrentUser } from "@/lib/db";
import stripe from "@/lib/stripe";
import { NextResponse } from "next/server";

const PRICE_AMOUNT = 5; // $5
const COINS_TO_GIVE = 10; // 10 coins for $5
const PRICE_ID = process.env.STRIPE_PRICE_ID; // Price ID for $5 - 10 coins package

export async function POST() {
  const user = await getCurrentUser();
  
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=true`,
      mode: 'payment',
      metadata: {
        userId: user.id,
        coins: COINS_TO_GIVE,
      },
    });

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: PRICE_AMOUNT,
        coins: COINS_TO_GIVE,
        stripeId: session.id,
        status: 'pending'
      }
    })

    return NextResponse.json({ url: session.url })
  } catch(error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}