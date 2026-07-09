import Stripe from 'stripe'

/**
 * Creates a Stripe Checkout Session for the Kouci Club License and returns its
 * URL for the client to redirect to. Runs as a Vercel Serverless Function —
 * the static site stays static; this is the only server-side code.
 *
 * Env (set in Vercel → Project → Environment Variables):
 *  - STRIPE_SECRET_KEY   (required) sk_live_… / sk_test_…
 *  - STRIPE_PRICE_ID     (preferred) a one-time Price for the club license
 *  - STRIPE_AMOUNT_EUR   (fallback if no price id) integer euros, default 2000
 */

interface CheckoutBody {
  club?: string
  name?: string
  email?: string
  country?: string
}

// Minimal req/res typing to avoid pulling @vercel/node types into the repo.
interface Req {
  method?: string
  body?: CheckoutBody | string
  headers: Record<string, string | string[] | undefined>
}
interface Res {
  status: (code: number) => Res
  json: (data: unknown) => void
  setHeader: (k: string, v: string) => void
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    // Payments not switched on yet — the client shows a friendly fallback.
    res.status(503).json({ error: 'payments_not_configured' })
    return
  }

  let body: CheckoutBody
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
  } catch {
    res.status(400).json({ error: 'invalid_json' })
    return
  }

  const club = (body.club ?? '').toString().slice(0, 120).trim()
  const name = (body.name ?? '').toString().slice(0, 120).trim()
  const email = (body.email ?? '').toString().slice(0, 200).trim()
  const country = (body.country ?? '').toString().slice(0, 80).trim()

  if (!club || !email) {
    res.status(400).json({ error: 'missing_fields' })
    return
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const origin = `${proto}://${host}`

  try {
    const stripe = new Stripe(secret)

    const priceId = process.env.STRIPE_PRICE_ID
    const amountEur = Number(process.env.STRIPE_AMOUNT_EUR || 2000)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: 'eur',
                unit_amount: Math.round(amountEur * 100),
                product_data: {
                  name: 'Kouci Club License — v1',
                  description: `One-time club license. Club: ${club}`,
                },
              },
            },
      ],
      metadata: { club, contact_name: name, country },
      // Stripe collects the billing address + tax IDs for a proper invoice.
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      invoice_creation: { enabled: true },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[checkout] stripe error', err)
    res.status(502).json({ error: 'stripe_error' })
  }
}
