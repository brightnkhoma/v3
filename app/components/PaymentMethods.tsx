// app/profile/components/PaymentMethods.tsx
'use client';

import { useState } from 'react';
import { PaymentMethod, UserWallet } from '../lib/types';

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  wallet: UserWallet;
}

export default function PaymentMethods({ paymentMethods, wallet }: PaymentMethodsProps) {
  const [showAddCard, setShowAddCard] = useState(false);

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return '💳';
      case 'paypal':
        return '📊';
      case 'crypto':
        return '₿';
      default:
        return '💵';
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'crypto':
        return 'Cryptocurrency';
      default:
        return 'Other';
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Wallet Balance
          </h2>
        </div>
        <div className="px-6 py-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              ${wallet.balance.toFixed(2)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Available for purchases and subscriptions
            </p>
            <button className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors font-medium">
              Add Funds
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Payment Methods
          </h2>
          <button
            onClick={() => setShowAddCard(true)}
            className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Add Payment Method
          </button>
        </div>
        <div className="p-6">
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">💳</div>
              <p className="text-gray-600 dark:text-gray-400">
                No payment methods added yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.methodId}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{getPaymentIcon(method.type)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {getPaymentLabel(method.type)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.type === 'credit_card' && `•••• ${(method.details as any).last4}`}
                      </p>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction History - You can expand this later */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            Transaction history will appear here
          </p>
        </div>
      </div>
    </div>
  );
}