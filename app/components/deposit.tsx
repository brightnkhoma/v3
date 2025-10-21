"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Wallet, Check, Loader2, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { makePayment } from "../lib/payChangu/payChanguPay"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { deposit, getBalance } from "../lib/dataSource/contentDataSource"
import { showToast } from "../lib/dataSource/toast"
import { UserWallet } from "../lib/types"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { user } = useAppSelector((state: RootState) => state.auth)
  const [wallet, setWallet] = useState<UserWallet>()

  const onGetBalance = async()=>{
    const _balance = await getBalance(user.userId)
    setWallet(_balance)
  }

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]

  const onBuyContent = async () => {
    await deposit(user, Number(amount), (txId) => {
      makePayment({
        amount: Number(amount),
        customer: {
          email: user.email,
          first_name: user.name.split(" ")[0],
          last_name: user.name.split(" ")[1] || ""
        },
        txId
      })
    }, () => {
      setIsSubmitting(false)
      showToast("Something went wrong, please try again later.")
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) < 100) return
    
    setIsSubmitting(true)
    await onBuyContent()
    setIsSubmitting(false)
  }

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString())
  }
  useEffect(()=>{
    onGetBalance()
  },[user])

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Success Illustration Side */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-green-200 to-blue-200 dark:from-green-800/30 dark:to-blue-800/30 rounded-full flex items-center justify-center">
                  <Check className="h-24 w-24 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-bold text-foreground mb-2">Wallet Successfully Funded!</h3>
              <p className="text-muted-foreground">Your funds are ready to use for amazing content</p>
            </div>
          </div>

          {/* Success Content Side */}
          <Card className="w-full max-w-md mx-auto lg:mx-0">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="lg:hidden mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Deposit Successful!</h2>
                  <p className="text-muted-foreground">
                    MWK {Number(amount).toLocaleString()} has been added to your wallet
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount Deposited</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      MWK {Number(amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">New Balance</span>
                    <span className="font-medium text-foreground">
                      MWK {(Number(amount) + (wallet?.balance || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/dashboard">
                      Back to Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile?tab=library">
                      Browse Content
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <Button asChild variant="ghost" className="mb-6 -ml-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Instant Deposit
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Add Funds to Your Wallet
            </h1>
            <p className="text-lg text-muted-foreground">
              Top up your wallet to unlock premium content and exclusive features
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Deposit Card */}
          <Card className="lg:col-span-2 border shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                <Wallet className="h-7 w-7 text-primary" />
                Deposit Amount
              </CardTitle>
              <CardDescription className="text-base">
                Choose how much you want to add to your wallet
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Quick Amount Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Quick Select Amounts</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        type="button"
                        variant={amount === quickAmount.toString() ? "default" : "outline"}
                        className="h-14 text-base font-medium transition-all duration-200 hover:scale-105"
                        onClick={() => handleQuickAmount(quickAmount)}
                      >
                        MWK {quickAmount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Custom Amount Input */}
                <div className="space-y-4">
                  <Label htmlFor="amount" className="text-base font-medium">
                    Or Enter Custom Amount
                  </Label>
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-muted-foreground font-medium text-lg">MWK</span>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-20 h-14 text-xl font-medium border-2 focus:border-primary"
                      placeholder="0.00"
                      min="100"
                      step="100"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Minimum deposit: MWK 100
                  </p>
                </div>

                <Separator />

                {/* Security Alert */}
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300 text-base">
                    You'll be redirected to a secure payment gateway to complete your deposit
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold"
                  disabled={isSubmitting || !amount || Number(amount) < 100}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing Deposit...
                    </>
                  ) : (
                    `Continue to Payment - MWK ${Number(amount).toLocaleString() || "0"}`
                  )}
                </Button>

                {/* Terms */}
                <p className="text-sm text-muted-foreground text-center">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Side Info Panel */}
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Wallet Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Balance */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Current Balance</Label>
                <div className="text-2xl font-bold text-foreground">
                  MWK {(wallet?.balance || 0).toLocaleString()}
                </div>
              </div>

              <Separator />

              {/* Benefits */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Benefits</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-foreground">Instant access to premium content</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-foreground">Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm text-foreground">Use across all content types</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Support Info */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Need help with your deposit?</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-2xl mx-auto">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="font-semibold text-foreground">Instant Processing</div>
            <div className="text-sm text-muted-foreground">Funds available immediately</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="font-semibold text-foreground">Bank-Level Security</div>
            <div className="text-sm text-muted-foreground">Your data is protected</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div className="font-semibold text-foreground">24/7 Support</div>
            <div className="text-sm text-muted-foreground">We're here to help</div>
          </div>
        </div>
      </div>
    </div>
  )
}