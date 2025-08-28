"use client"

import { useState } from "react"
import { UserSquare2, Mail, Settings, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthTypes, register } from "../lib/dataSource/userDataSource"
import { showToast } from "../lib/dataSource/toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export const SignUpPage = () => {
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const onSignUpSuccess = () => {
    setLoading(false)
    showToast("Sign up Success.")
    router.push("/login")
  }
  
  const onSignUpFailure = (reason: string) => {
    setLoading(false)
    showToast(reason)
  }

  const onSignUp = async () => {
    if (!firstName || !lastName || !email || !password) return;
    const data: AuthTypes = {
      name: firstName + " " + lastName,
      password,
      email
    }
    setLoading(true)
    await register(data, onSignUpSuccess, onSignUpFailure)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300 p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="mb-6">
            <div className="h-16 w-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white dark:text-black transition-colors duration-300">
                <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-2 14.5v-9l6 4.5z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2 transition-colors duration-300">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Join us to get started
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {/* Name Fields */}
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex-1">
              <FieldInput
                icon={<UserSquare2 className="text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-300" size={20} />}
                name="First Name"
                onValueChange={setFirstName}
                value={firstName}
                placeholder="Yohane"
                themeAware={true}
                type="text"
              />
            </div>
            <div className="flex-1">
              <FieldInput
              type="text"
                icon={<UserSquare2 className="text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-300" size={20} />}
                name="Last Name"
                onValueChange={setLastName}
                value={lastName}
                placeholder="Banda"
                themeAware={true}
              />
            </div>
          </div>

          {/* Email and Password */}
          <div className="flex flex-col gap-6 w-full">
            <FieldInput
            type="text"
              icon={<Mail className="text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-300" size={20} />}
              name="Email"
              onValueChange={setEmail}
              value={email}
              placeholder="example@zathuplay.com"
              themeAware={true}
            />
            <FieldInput
              type="password"
              icon={<Settings className="text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-300" size={20} />}
              name="Password"
              onValueChange={setPassword}
              value={password}
              placeholder="••••••••"
              themeAware={true}
            />
          </div>

          <Button 
            onClick={onSignUp} 
            disabled={loading}
            className="w-full py-5 text-base font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-70"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 size={20} className="animate-spin mr-2" />
                Creating Account...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Create Account <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            )}
          </Button>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-black dark:text-white hover:underline transition-colors duration-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


// Example of how FieldInput might be implemented with theme support
const FieldInput = ({ icon, name, onValueChange, value, placeholder, type = "text", themeAware = false } : {icon : React.ReactNode, name : string, onValueChange : (value : string)=> void, value : string, placeholder : string, type : string, themeAware : boolean}) => {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
        {name}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-300 ${
            themeAware 
              ? "border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white focus:ring-black dark:focus:ring-white focus:border-transparent" 
              : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
          }`}
        />
      </div>
    </div>
  )
}