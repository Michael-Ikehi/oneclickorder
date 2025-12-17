'use client'
import SignUp from '@/components/auth/sign-up/SignUp'
import { useInitializeStoreParams } from '@/lib/hooks/useInitializeStoreParams'

const SignUpPage = () => {
  useInitializeStoreParams()
  
  return <SignUp />
}

export default SignUpPage
