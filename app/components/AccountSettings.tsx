'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserWallet } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Wallet, 
  Plus, 
  Minus, 
  CreditCard, 
  Building, 
  Smartphone, 
  User as UserIcon,
  Calendar,
  Shield,
  HelpCircle,
  Settings,
  FileText,
  AlertTriangle,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { firestoreTimestampToDate } from '../lib/config/timestamp';
import { getBalance, onListenToBalanceChanges, refreshBalance } from '../lib/dataSource/contentDataSource';

interface AccountSettingsProps {
  user: User;
  wallet: UserWallet;
  onUpdate: (user: Partial<User>) => void;
}

export default function AccountSettings({ user, onUpdate }: AccountSettingsProps) {
  const router = useRouter();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [balance, setBalance] = useState(0) 
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
    const wallet : UserWallet = {balance,lastUpdatedDate : lastUpdate as Date,userId : user.userId}

   
  
    
  
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

    }
  
    const handleGetBalance = async () => {
      if (!user?.userId) return
      
      try {
        const _balance = await getBalance(user.userId)
        if (_balance) {
          setBalance(_balance.balance)
          setLastUpdate(firestoreTimestampToDate(_balance.lastUpdatedDate as any))
        }
      } catch (error) {
        console.error("Error fetching balance:", error)
      }
    }
  
    
  
   
    useEffect(() => {
      if (user?.userId) {
        handleGetBalance()
        handleListenToBalance()
      } else {
        setBalance(0)
      }
    }, [user])
  
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



  const handleDeposit = () => {
    router.push('/deposit');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      return;
    }

    if (parseFloat(withdrawAmount) > wallet.balance) {
      return;
    }

    setIsWithdrawing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setWithdrawAmount('');
      setShowWithdrawModal(false);
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getAccountTypeVariant = (type: string) => {
    switch (type) {
      case 'PREMIUM':
        return 'default';
      case 'FAMILY':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const quickActions: any[] = [
    // {
    //   title: 'Transaction History',
    //   description: 'View your payment history',
    //   icon: FileText,
    //   variant: 'outline' as const,
    //   onClick: () => router.push('/transactions')
    // },
    // {
    //   title: 'Payment Methods',
    //   description: 'Manage your payment options',
    //   icon: CreditCard,
    //   variant: 'outline' as const,
    //   onClick: () => router.push('/payment-methods')
    // },
    // {
    //   title: 'Help Center',
    //   description: 'Get support and help',
    //   icon: HelpCircle,
    //   variant: 'outline' as const,
    //   onClick: () => router.push('/help')
    // },
    // {
    //   title: 'Security',
    //   description: 'Account security settings',
    //   icon: Shield,
    //   variant: 'outline' as const,
    //   onClick: () => router.push('/security')
    // }
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br  ">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">Total Balance</CardTitle>
              <CardDescription className=" ">
                Available for purchases & withdrawals
              </CardDescription>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-6">MWK{wallet.balance.toFixed(2)}</div>
          <div className="flex gap-3">
            <Button
              onClick={handleDeposit}
              variant="secondary"
              className="flex-1 backdrop-blur-sm border-white/30  "
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button
              onClick={() => setShowWithdrawModal(true)}
              variant="default"
              className="flex-1  "
              size="lg"
            >
              <Minus className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
        <CardFooter className="  backdrop-blur-sm border-t border-white/20 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm w-full">
            <div className="text-center">
              <p className=" ">Last Updated</p>
              <p className="font-semibold">{formatTimeAgo(new Date(wallet.lastUpdatedDate as any))}</p>
            </div>
            <div className="text-center">
              <p className="text-purple-100">Account Type</p>
              <p className="font-semibold capitalize">{user.accountType.toLowerCase()}</p>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="h-auto p-4 flex flex-col items-center gap-3"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6" />
            <div className="text-center">
              <div className="text-sm font-medium">{action.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label htmlFor="account-type">Account Type</Label>
                <Badge variant={getAccountTypeVariant(user.accountType)}>
                  {user.accountType.toLowerCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label htmlFor="member-since">Member Since</Label>
                <span className="text-sm font-medium">{firestoreTimestampToDate(user.joinDate as any).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label htmlFor="user-id">User ID</Label>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {Array.from({length : 30}).map(_=> "*").join("")}
                </code>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label htmlFor="status">Status</Label>
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Danger Zone</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-medium">Delete Account</p>
            <p className="text-sm opacity-90 mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </AlertDescription>
      </Alert>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5" />
              Withdraw Funds
            </DialogTitle>
            <DialogDescription>
              Choose your withdrawal method and enter the amount you want to withdraw.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="mobile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile Money
              </TabsTrigger>
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Bank Transfer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mobile" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['TNM Mpamba', 'Airtel Money', 'Tigo Pesa', 'Orange Money'].map((provider) => (
                  <Button
                    key={provider}
                    variant="outline"
                    className="h-16 flex flex-col gap-1"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span className="text-xs">{provider}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['Equity Bank', 'KCB Bank', 'Cooperative Bank', 'Barclays Bank'].map((bank) => (
                  <Button
                    key={bank}
                    variant="outline"
                    className="h-16 flex flex-col gap-1"
                  >
                    <Building className="h-4 w-4" />
                    <span className="text-xs">{bank}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount to Withdraw</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground sm:text-sm">MWK</span>
                </div>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-12"
                  min="0"
                  max={wallet.balance}
                  step="0.01"
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Available: MWK{wallet.balance.toFixed(2)}
                </span>
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => setWithdrawAmount(wallet.balance.toString())}
                >
                  Use Max
                </Button>
              </div>
            </div>

            {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Withdrawal Amount</span>
                  <span className="font-medium">MWK{parseFloat(withdrawAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee</span>
                  <span className="font-medium">MWK1.50</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-medium">
                  <span>You Will Receive</span>
                  <span>MWK{(parseFloat(withdrawAmount) - 1.50).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowWithdrawModal(false)}
              disabled={isWithdrawing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                isWithdrawing ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) <= 0 ||
                parseFloat(withdrawAmount) > wallet.balance
              }
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}