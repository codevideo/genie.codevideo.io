import Head from 'next/head'
import { PaymentSuccessContent } from '@/components/payments/PaymentSuccessContent'

export default function SuccessPro() {
  return (
    <>
      <Head>
        <title>Welcome to Pro! - CodeVideo Genie</title>
      </Head>
      <PaymentSuccessContent tier="pro" />
    </>
  )
}
