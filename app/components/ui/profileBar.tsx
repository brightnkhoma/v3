"use client"

import { useState, useRef, useEffect } from "react"
import { User, LogOut, LogIn, Wallet, PlusCircle, ChevronDown,RefreshCcw } from "lucide-react"
import Link from "next/link"
import { RootState, useAppSelector } from "@/app/lib/local/redux/store"
import { onListenToBalanceChanges,refreshBalance } from "@/app/lib/dataSource/contentDataSource"
import { UserWallet } from "@/app/lib/types"
import { useRouter } from "next/navigation"

export const ProfileBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [balance, setBalance] = useState(0) 
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {user} = useAppSelector((state : RootState)=> state.auth)
  const router = useRouter()
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const isLoggedIn = user && user.userId && user.userId.length > 5

  const initials = (user.name || "").split(" ").map(x=> x.trim().toUpperCase()[0]).join("") || "Register"

  const onListenTOBalance = async()=>{
    setRefreshing(true)
    await onListenToBalanceChanges(user.userId,onRefreshBalanceSuccess)
    setRefreshing(false)
  }
  const onRefreshBalanceSuccess = (data: UserWallet)=>{
    setBalance(data.balance || balance)

  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const onRefreshBalance = async()=>{
        setRefreshing(true)

    await refreshBalance(user)
    setRefreshing(false)
  }

  useEffect(()=>{
    onListenTOBalance()
    onRefreshBalance()
  },[user])

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK'
    }).format(amount)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 cbg-gray-100 chover:bg-gray-200 p-2 rounded-full transition-colors"
      >
        <div className="w-8 h-8 rounded-full cbg-blue-500 flex items-center justify-center ctext-white font-bold">
          {initials}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-4 border-b cborder-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full cbg-blue-500 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
              <div>
                <p className="font-medium ctext-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-b cborder-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 ctext-gray-700">
                <Wallet className="w-5 h-5" />
                <span className="text-sm">Balance</span>
                {
                  refreshing ?  <RefreshCcw className="animate-spin"  size={15}/> :  <RefreshCcw onClick={onRefreshBalance}  size={15}/>
                }

              </div>
              <span className="font-medium">{formatBalance(balance)}</span>
            </div>
          </div>

          <button onClick={()=>{router.push("/deposit")}} className="w-full flex items-center gap-3 p-3 chover:bg-gray-50 text-left">
            <PlusCircle className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Deposit MWK</span>
          </button>

          {isLoggedIn ? (
            <button 
              onClick={() => {}}
              className="w-full flex items-center gap-3 p-3 chover:bg-gray-50 text-left border-t cborder-gray-100"
            >
              <LogOut className="w-5 h-5 ctext-gray-700" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          ) : (
            <Link 
              href="/login"
              className="w-full flex items-center gap-3 p-3 chover:bg-gray-50 text-left border-t cborder-gray-100"
            >
              <LogIn className="w-5 h-5 ctext-gray-700" />
              <span className="text-sm font-medium">Sign in</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}