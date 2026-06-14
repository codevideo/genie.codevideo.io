# CodeVideo Genie

AI-powered programming tutorial generator. Learn any coding concept with personalized tutorials generated in seconds.

## Overview

Genie is the consumer-facing UI for CodeVideo - an event-sourced IDE state manager that captures coding sessions as discrete actions rather than video recordings. This enables:

- **Personalized learning**: AI generates tutorials tailored to your experience level
- **Interactive playback**: Step through code at your own pace, copy at any step
- **Multi-format export**: Markdown, HTML, PDF, and video with TTS narration
- **Validated code**: Generated tutorials compile and run - guaranteed

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Auth**: Clerk
- **Payments**: Stripe (via Go Netlify Functions)
- **State**: Redux Toolkit + Redux Persist
- **Deployment**: Netlify

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 3 generations/month, Markdown export |
| Pro | $19/mo | Unlimited generations, all exports, video + TTS |
| Pro Lifetime | $99 | Everything in Pro, forever |

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Clerk and Stripe keys

# Run dev server
npm run dev
```

## Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe (for Go functions)
STRIPE_SECRET_KEY=
```

## Project Structure

```
├── src/
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks (useUserTier, etc.)
│   ├── pages/           # Next.js pages
│   │   ├── index.tsx    # Landing page (learner/creator selection)
│   │   ├── learn.tsx    # Learner prompt input
│   │   ├── create.tsx   # Creator course builder
│   │   ├── pricing.tsx  # Pricing page
│   │   └── success-*.tsx # Payment success pages
│   └── store/           # Redux store
│       ├── genieSlice.ts   # Generation state
│       └── authSlice.ts    # Auth state
├── functions/           # Go Netlify Functions
│   └── stripeSuccess/   # Payment verification
└── public/
```

## Deployment

### Netlify Setup

1. Connect repo to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy

Build command is configured in `netlify.toml`:
```toml
[build]
  command = "npm run build && cd functions && chmod +x build-go-functions.sh && ./build-go-functions.sh"
  publish = ".next/"
```

### Stripe Setup

1. Create two products in Stripe:
   - **Pro Monthly**: $19/month subscription
   - **Pro Lifetime**: $99 one-time payment

2. Create Payment Links for each product with success URLs:
   - Pro Monthly → `https://genie.codevideo.io/success-pro?session_id={CHECKOUT_SESSION_ID}`
   - Pro Lifetime → `https://genie.codevideo.io/success-pro-lifetime?session_id={CHECKOUT_SESSION_ID}`

3. Update the payment link URLs in `src/pages/pricing.tsx`

### Clerk Setup

1. Create a Clerk application
2. Configure sign-in/sign-up URLs
3. Add keys to Netlify environment variables

## Related Repositories

- [codevideo-types](https://github.com/codevideo/codevideo-types) - Core action types
- [codevideo-virtual-ide](https://github.com/codevideo/codevideo-virtual-ide) - Virtual IDE state manager
- [codevideo-mcp](https://github.com/codevideo/codevideo-mcp) - MCP server for LLM generation
- [codevideo-cli](https://github.com/codevideo/codevideo-cli) - Video rendering CLI

## License

MIT
