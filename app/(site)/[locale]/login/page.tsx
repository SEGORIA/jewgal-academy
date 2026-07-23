import { Suspense } from "react"
import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fdf9f4] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#d49341] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
