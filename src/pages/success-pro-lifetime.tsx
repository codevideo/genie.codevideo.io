import Head from 'next/head'
import { PaymentSuccessContent } from '@/components/payments/PaymentSuccessContent'

export default function SuccessProLifetime() {
  return (
    <>
      <Head>
        <title>Welcome to Pro Lifetime! - CodeVideo Genie</title>
      </Head>
      <PaymentSuccessContent tier="pro-lifetime" />
    </>
  )
}
