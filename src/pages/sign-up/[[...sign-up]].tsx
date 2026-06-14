import { SignUp } from '@clerk/nextjs'
import Head from 'next/head'

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up - CodeVideo Genie</title>
      </Head>
      <div className="min-h-screen flex justify-center items-center pt-16">
        <SignUp />
      </div>
    </>
  )
}
