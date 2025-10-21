// app/profile/components/ProfileHeader.tsx
'use client';

import { AccountType, User, UserWallet } from "../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  Camera, 
  Wallet, 
  Plus,
  Calendar,
  Crown,
  Users,
  Star
} from 'lucide-react';
import { firestoreTimestampToDate } from "../lib/config/timestamp";
import { useEffect, useState } from "react";
import { getBalance } from "../lib/dataSource/contentDataSource";

interface ProfileHeaderProps {
  user: User;
  wallet: UserWallet;
  onAvatarChange: (avatarUrl: string) => void;
  onDepositClick: () => void;
}

export default function ProfileHeader({ user, wallet, onAvatarChange, onDepositClick }: ProfileHeaderProps) {
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


          useEffect(()=>{
            handleGetBalance()
          },[])
  const getAccountTypeVariant = (type: AccountType) => {
    switch (type) {
      case AccountType.PREMIUM:
        return 'default';
      case AccountType.FAMILY:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.PREMIUM:
        return <Crown className="h-4 w-4" />;
      case AccountType.FAMILY:
        return <Users className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case AccountType.PREMIUM:
        return 'Premium Member';
      case AccountType.FAMILY:
        return 'Family Plan';
      default:
        return 'Free Account';
    }
  };

  const getAccountTypeColor = (type: AccountType) => {
    switch (type) {
      case AccountType.PREMIUM:
        return 'from-purple-500 to-pink-500';
      case AccountType.FAMILY:
        return 'from-green-500 to-blue-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserIcon className="h-5 w-5" />
          Profile Overview
        </CardTitle>
        <CardDescription>
          Your account summary and quick actions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <Button
              size="icon"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg"
              onClick={() => onAvatarChange('/new-avatar.jpg')}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {user.name}
            </h3>
            <Badge 
              variant={getAccountTypeVariant(user.accountType)}
              className={`bg-gradient-to-r ${getAccountTypeColor(user.accountType)} text-white border-0`}
            >
              {getAccountTypeIcon(user.accountType)}
              <span className="ml-1">{getAccountTypeLabel(user.accountType)}</span>
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Wallet Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Wallet Balance
              </span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              MWK{balance.toFixed(2)}
            </span>
          </div>
          
          <Button 
            onClick={onDepositClick}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
        </div>

        <Separator />

        {/* Account Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground truncate max-w-[150px]">
              {user.email}
            </span>
          </div>
          
          {/* <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">User ID</span>
            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {user.userId.slice(0, 8)}...
            </code>
          </div> */}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Member since
            </span>
            <span className="font-medium text-foreground">
              {firestoreTimestampToDate(user.joinDate as any).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

       
      </CardContent>
    </Card>
  );
}