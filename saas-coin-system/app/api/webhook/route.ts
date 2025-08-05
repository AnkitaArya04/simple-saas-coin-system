import prisma from "@/lib/db";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature') as string;
  
  if(!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    const session = event.data.object as Stripe.Checkout.Session;

    if(event.type == 'checkout.session.completed') {
      const userId = session.metadata?.userId;
      const coins = session.metadata?.coins;

      if(!userId || !coins) {
        return NextResponse.json({ error: 'Mising userId or coins' }, { status: 400 });
      }

      // Update payment status
      await prisma.payment.update({
        where: { stripeId: session.id },
        data: { status: 'completed'}
      });

      // Add coins to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: parseInt(coins)}
        }
      })
    }

    return NextResponse.json({ received: true });
  } catch(error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}