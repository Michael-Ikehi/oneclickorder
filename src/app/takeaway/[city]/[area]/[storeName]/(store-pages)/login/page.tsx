'use client'
import Login from '@/components/auth/login/Login'
import { useInitializeStoreParams } from '@/lib/hooks/useInitializeStoreParams'

const LoginPage = () => {
  useInitializeStoreParams()
  
  return <Login />
}

export default LoginPage
