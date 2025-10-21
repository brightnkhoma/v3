'use client';

import { useEffect, useState } from 'react';
import { AccountType, LikedContent, PurchasedContent, User, UserWallet } from '../lib/types';
import AccountSettings from '../components/AccountSettings';
import LibrarySection from '../components/LibrarySection';
import ProfileHeader from '../components/ProfileHeader';
import { RootState, useAppSelector } from '../lib/local/redux/store';
import { AlertCircle, Book, CheckCircle2, Mail, Save, Settings, User2, UserIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { firestoreTimestampToDate } from '../lib/config/timestamp';
import { Button } from '@/components/ui/button';
import { getBalance } from '../lib/dataSource/contentDataSource';



const mockPurchasedContent: PurchasedContent[] = [
  {
    id: "content_1",
    date: new Date("2024-01-15"),
    type: "MOVIE" as any,
    name: "Awesome Movie",
    thumbNail: "/thumbnails/movie1.jpg",
    txnId: "txn_123",
    status: 'processed',
    price: 4.99,
    ownerId: "user_123"
  }
];

const mockLikedContent: LikedContent[] = [
  {
    id: "content_2",
    date: new Date("2024-01-10"),
    type: "MUSIC_TRACK" as any,
    name: "Great Song",
    thumbNail: "/thumbnails/song1.jpg"
  }
];

const mockWallet: UserWallet = {
  balance: 25.50,
  lastUpdatedDate: new Date(),
  userId: "user_123"
};

export default function ProfilePage() {
  const {user} = useAppSelector((state : RootState) => state.auth)
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'payment' | 'library' | 'preferences'>('profile');
  const [balance, setBalance] = useState< number >(0)
  const [lastUpdate, setLastUpdate] = useState<Date>()

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

  const updateUser = (updatedUser: Partial<User>) => {
    // setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User2/> },
    { id: 'account', label: 'Account', icon: <Settings/> },
    { id: 'library', label: 'Library', icon: <Book/> },
  ];

  useEffect(()=>{
    handleGetBalance()
  },[])

  return (
    <div className="min-h-screen  ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your ZathuPlay account 
          </p>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex flex-row items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-1">
            <ProfileHeader 
                          user={user}
                          wallet={mockWallet}
                          onAvatarChange={(avatarUrl) => updateUser({ avatar: avatarUrl })} onDepositClick={function (): void {
                              throw new Error('Function not implemented.');
                          } }            />
          </div>

           <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <ProfileForm user={user} onUpdate={updateUser} />
            )}
            {activeTab === 'account' && (
              <AccountSettings user={user} onUpdate={updateUser} wallet={{balance,lastUpdatedDate : lastUpdate as Date,userId : user.userId}} />
            )}
            
            {activeTab === 'library' && (
              <LibrarySection 
                purchasedContent={mockPurchasedContent}
                likedContent={mockLikedContent}
              />
            )}
           
          </div>
        </div>
      </div>
    </div>
  );
}

 

function ProfileForm({ user, onUpdate }: { user: User; onUpdate: (user: Partial<User>) => void }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpdate(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = formData.name !== user.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your account's profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              This is the name that will be displayed on your profile
            </p>
          </div>

          {/* Email Field - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Input
                type="email"
                id="email"
                value={formData.email}
                readOnly
                disabled
                className="w-full bg-muted/50 border-muted text-muted-foreground pr-10"
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Email address cannot be changed. Please contact support if you need to update your email.
              </AlertDescription>
            </Alert>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {hasChanges ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  You have unsaved changes
                </span>
              ) : (
                'All changes saved'
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={!hasChanges || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="border-t pt-6 mt-6">
          <h4 className="text-sm font-medium mb-3">Profile Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-medium">{firestoreTimestampToDate(user.joinDate as any).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {user.userId}
              </code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}