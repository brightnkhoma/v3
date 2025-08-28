"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "./form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { AuthTypes, signIn } from "../lib/dataSource/userDataSource"
import { useRouter } from "next/navigation"
import { showToast } from "../lib/dataSource/toast"
import { useAppDispatch } from "../lib/local/redux/store"
import { login } from "../lib/local/redux/reduxSclice"
import { User } from "../lib/types"
import { useState, useTransition } from "react"

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function SignInPage() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const onSignInSuccess = (user: User) => {
    dispatch(login(user))
    showToast("Successfully signed in!")
    router.push("/")
  }

  const onSignInFailure = () => {
    showToast("Sign in failed. Please check your credentials.")
  }

  const onSignIn = async (data: AuthTypes) => {
    startTransition(async () => {
      await signIn(data, onSignInSuccess, onSignInFailure)
    })
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data: AuthTypes = {
      email: values.email,
      password: values.password
    }
    await onSignIn(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="h-16 w-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white dark:text-black transition-colors duration-300">
                <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-2 14.5v-9l6 4.5z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2 transition-colors duration-300">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Sign in to continue to your account
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-transparent rounded-2xl p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors duration-300 group-focus-within:text-black dark:group-focus-within:text-white" />
                        <Input
                          placeholder="your@email.com"
                          className="pl-10 py-5 text-base border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white transition-all duration-300 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors duration-300 group-focus-within:text-black dark:group-focus-within:text-white" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 py-5 text-base border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white transition-all duration-300 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white transition-colors duration-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-700 rounded bg-transparent"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-black dark:text-white hover:underline transition-colors duration-300"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full py-5 text-base font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-70"
              >
                {isPending ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-black dark:text-white hover:underline transition-colors duration-300"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}