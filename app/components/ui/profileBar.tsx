"use client"

import { useState, useRef, useEffect } from "react"
import { User, LogOut, LogIn, Wallet, PlusCircle, ChevronDown, RefreshCcw, Settings, User as UserIcon, CreditCard } from "lucide-react"
import Link from "next/link"
import { RootState, useAppDispatch, useAppSelector } from "@/app/lib/local/redux/store"
import { onListenToBalanceChanges, refreshBalance, getBalance } from "@/app/lib/dataSource/contentDataSource"
import { UserWallet } from "@/app/lib/types"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/app/lib/local/redux/reduxSclice"

export const ProfileBar = ({ compact = false }: { compact?: boolean }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [balance, setBalance] = useState(0) 
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useAppSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      
      dispatch(logout())
      
      setIsMenuOpen(false)
      
      setTimeout(() => {
        router.push("/login")
        router.refresh() 
      }, 1000)
      
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    } finally {
      // Reset loading state after navigation
      setTimeout(() => setIsLoggingOut(false), 2000)
    }
  }

  const isLoggedIn = user && user.userId && user.userId.length > 5
  const initials = (user?.name || "Guest").split(" ").map(x => x.trim().toUpperCase()[0]).join("").slice(0, 2) || "GU"

  // Balance management
  const handleListenToBalance = async () => {
    if (!user?.userId) return
    
    setIsRefreshing(true)
    try {
      await onListenToBalanceChanges(user.userId, onRefreshBalanceSuccess)
    } catch (error) {
      console.error("Error listening to balance:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const onRefreshBalanceSuccess = (data: UserWallet) => {
    setBalance(data.balance || balance)
    setLastUpdate(new Date())
  }

  const handleGetBalance = async () => {
    if (!user?.userId) return
    
    try {
      const _balance = await getBalance(user.userId)
      if (_balance) {
        setBalance(_balance.balance)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const handleRefreshBalance = async () => {
    if (isRefreshing || !user) return
    
    setIsRefreshing(true)
    try {
      await refreshBalance(user)
      // Force a balance refetch after refresh
      setTimeout(() => handleGetBalance(), 500)
    } catch (error) {
      console.error("Error refreshing balance:", error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (user?.userId) {
      handleGetBalance()
      handleListenToBalance()
    } else {
      // Reset balance for logged out users
      setBalance(0)
      setLastUpdate(null)
    }
  }, [user])

  // Formatting functions
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Never"
    
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const ProfileDropdown = () => (
    <div className={cn(
      "absolute right-0 mt-2 w-72 sm:w-80 bg-background rounded-xl shadow-2xl border border-border/50",
      "backdrop-blur-xl bg-background/95 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95",
      "duration-200 origin-top-right"
    )}>
      {/* Header Section */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg",
            "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
            "border border-primary/20 text-sm"
          )}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate text-sm">
              {user?.name || "Guest User"}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user?.email || "Sign in to access features"}
            </p>
            {lastUpdate && isLoggedIn && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Updated {formatTimeAgo(lastUpdate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Balance Section - Only show if logged in */}
      {isLoggedIn && (
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Available Balance</span>
            </div>
            <button
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
              aria-label="Refresh balance"
            >
              <RefreshCcw className={cn(
                "w-3.5 h-3.5 transition-transform",
                isRefreshing && "animate-spin"
              )} />
            </button>
          </div>
          
          <div className="flex items-baseline justify-between">
            <span className={cn(
              "text-2xl font-bold transition-colors duration-200",
              isRefreshing ? "text-muted-foreground/70" : "text-foreground"
            )}>
              {formatBalance(balance)}
            </span>
            {isRefreshing && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="p-2">
        {isLoggedIn ? (
          <>
            <button 
              onClick={() => { router.push("/deposit"); setIsMenuOpen(false) }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground group",
                "border border-transparent hover:border-primary/20",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <PlusCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">Deposit Funds</p>
                <p className="text-xs text-muted-foreground">Add MWK to your wallet</p>
              </div>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </button>

            <button 
              onClick={() => { router.push("/profile"); setIsMenuOpen(false) }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mt-1",
                "hover:bg-accent hover:text-accent-foreground group",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <UserIcon className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">Profile Settings</p>
                <p className="text-xs text-muted-foreground">Manage your account</p>
              </div>
            </button>

            {/* <button 
              onClick={() => { router.push("/settings"); setIsMenuOpen(false) }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mt-1",
                "hover:bg-accent hover:text-accent-foreground group",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              <div className="p-2 rounded-lg bg-gray-500/10 group-hover:bg-gray-500/20 transition-colors">
                <Settings className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">Preferences</p>
                <p className="text-xs text-muted-foreground">Customize your experience</p>
              </div>
            </button> */}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">Sign in to access all features</p>
            <Link 
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              <LogIn className="w-4 h-4" />
              <span className="font-medium">Sign In</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="p-2 border-t border-border/50">
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
              "hover:bg-destructive/10 hover:text-destructive group",
              "border border-transparent hover:border-destructive/20",
              "focus:outline-none focus:ring-2 focus:ring-destructive/20",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
              <LogOut className={cn(
                "w-4 h-4 text-destructive",
                isLoggingOut && "animate-pulse"
              )} />
            </div>
            <span className="font-medium text-sm">
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </span>
          </button>
        ) : (
          <Link 
            href="/signup"
            onClick={() => setIsMenuOpen(false)}
            className={cn(
              "w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground group",
              "border border-border/50 hover:border-primary/20",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          >
            <User className="w-4 h-4" />
            <span className="font-medium text-sm">Create Account</span>
          </Link>
        )}
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
            "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
            "hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md",
            "border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20",
            isMenuOpen && "ring-2 ring-primary/20"
          )}
          aria-label="Profile menu"
          aria-expanded={isMenuOpen}
        >
          <span className="text-xs font-bold">
            {initials}
          </span>
        </button>

        {isMenuOpen && <ProfileDropdown />}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          "flex items-center gap-2 p-2 rounded-xl transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "border border-transparent hover:border-border",
          "shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
          isMenuOpen && "bg-accent text-accent-foreground border-border ring-2 ring-primary/20"
        )}
        aria-label="Profile menu"
        aria-expanded={isMenuOpen}
      >
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm text-sm",
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
          "border border-primary/20"
        )}>
          {initials}
        </div>
        
        <div className="hidden sm:block text-left min-w-0 max-w-32">
          <p className="text-sm font-medium truncate">{user?.name || "Guest"}</p>
          <p className="text-xs text-muted-foreground truncate">
            {isLoggedIn ? formatBalance(balance) : "Sign in"}
          </p>
        </div>
        
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-200",
          isMenuOpen && "rotate-180"
        )} />
      </button>

      {isMenuOpen && <ProfileDropdown />}
    </div>
  )
}