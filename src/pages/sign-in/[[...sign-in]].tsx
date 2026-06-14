import { SignIn } from '@clerk/nextjs'
import Head from 'next/head'

export default function SignInPage() {
  return (
    <>
      <Head>
        <title>Sign In - CodeVideo Genie</title>
      </Head>
      <div className="min-h-screen flex justify-center items-center pt-16">
        <SignIn />
      </div>
    </>
  )
}
