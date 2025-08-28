"use client"

import { useState } from "react"
import { ArrowLeft, Wallet, CreditCard, Banknote, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { makePayment } from "../lib/payChangu/payChanguPay"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { deposit } from "../lib/dataSource/contentDataSource"
import { v4 } from "uuid"
import { showToast } from "../lib/dataSource/toast"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("mobile_money")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const {user} = useAppSelector((state : RootState)=> state.auth)

  const onBuyContent = async()=>{
    await deposit(user,Number(amount),(txId)=> {
    makePayment({amount : Number(amount),customer :{email : user.email, first_name : user.name.split(" ")[0],last_name : user.name.split(" ")[1]} ,txId})

    },()=>{
          setIsSubmitting(true)

      showToast("Something went wrong, please try again later.")
    })
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onBuyContent()
        setIsSubmitting(false)

    // setTimeout(() => {
    // }, 1500)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300 p-4">
        <div className="max-w-md w-full bg-transparent rounded-lg">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 transition-colors duration-300">
              <Check className="h-6 w-6 text-black dark:text-white transition-colors duration-300" />
            </div>
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Deposit Successful</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">
              MWK {Number(amount).toLocaleString()} has been added to your account balance.
            </p>
            <Button asChild className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300 p-4">
      <div className="max-w-md w-full bg-transparent rounded-lg">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to wallet
          </Link>
          <h1 className="text-2xl font-semibold mt-4 text-black dark:text-white transition-colors duration-300">Deposit Funds</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Add money to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label htmlFor="amount" className="block text-sm font-medium text-black dark:text-white mb-2 transition-colors duration-300">
              Amount (MWK)
            </Label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">MWK</span>
              </div>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-14 py-5 text-base border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white transition-colors duration-300 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                placeholder="0.00"
                min="100"
                step="100"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Minimum deposit: MWK 100</p>
          </div>

          <div className="mb-8">
            <Label className="block text-sm font-medium text-black dark:text-white mb-3 transition-colors duration-300">
              Payment Method
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                <RadioGroupItem value="mobile_money" id="mobile_money" className="text-black dark:text-white border-gray-300 dark:border-gray-700" />
                <Label htmlFor="mobile_money" className="flex items-center text-black dark:text-white transition-colors duration-300">
                  <Wallet className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
                  Mobile Money
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                <RadioGroupItem value="card" id="card" className="text-black dark:text-white border-gray-300 dark:border-gray-700" />
                <Label htmlFor="card" className="flex items-center text-black dark:text-white transition-colors duration-300">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
                  Credit/Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                <RadioGroupItem value="bank" id="bank" className="text-black dark:text-white border-gray-300 dark:border-gray-700" />
                <Label htmlFor="bank" className="flex items-center text-black dark:text-white transition-colors duration-300">
                  <Banknote className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
                  Bank Transfer
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            className="w-full py-5 text-base font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : `Deposit MWK ${Number(amount).toLocaleString() || "0"}`}
          </Button>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center transition-colors duration-300">
            Deposits are processed securely. By continuing, you agree to our Terms of Service.
          </p>
        </form>
      </div>
    </div>
  )
}