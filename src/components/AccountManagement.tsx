import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Wallet, CreditCard, PiggyBank, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Account } from '../types';
import AccountForm from './AccountForm';

interface AccountManagementProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onEditAccount: (accountId: string, account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (accountId: string) => void;
}

const AccountManagement: React.FC<AccountManagementProps> = ({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);

  const handleAddAccount = (accountData: Omit<Account, 'id'>) => {
    onAddAccount(accountData);
    setShowForm(false);
  };

  const handleEditAccount = (accountData: Omit<Account, 'id'>) => {
    if (editingAccount) {
      onEditAccount(editingAccount.id, accountData);
      setEditingAccount(null);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    onDeleteAccount(accountId);
    setShowDeleteConfirm(null);
  };

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return 'Account';
      case 'savings':
        return 'Savings';
      case 'credit':
        return 'Credit Card';
      case 'investment':
        return 'Investment';
      default:
        return 'Account';
    }
  };

  const getAccountTypeColor = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-600';
      case 'savings':
        return 'bg-green-100 text-green-600';
      case 'credit':
        return 'bg-red-100 text-red-600';
      case 'investment':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const formattedAmount = Math.abs(amount).toLocaleString('en-SG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    if (showSensitiveInfo) {
      return `${amount < 0 ? '-' : ''}${currency} ${formattedAmount}`;
    }
    return '••••••';
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Account Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your financial accounts and track balances
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Privacy Toggle */}
          <button
            onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
            className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation"
          >
            {showSensitiveInfo ? (
              <>
                <EyeOff className="h-4 w-4 text-gray-600" />
                <span className="text-xs sm:text-sm text-gray-600">Hide</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-gray-600" />
                <span className="text-xs sm:text-sm text-gray-600">Show</span>
              </>
            )}
          </button>

          {/* Add Account Button */}
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Account</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <p className="text-sky-100 text-xs sm:text-sm font-medium mb-1">Total Net Worth</p>
            <p className="text-2xl sm:text-3xl font-bold">
              {formatAmount(totalBalance, 'SGD')}
            </p>
            <p className="text-sky-100 text-xs sm:text-sm mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg self-start sm:self-auto">
            <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-3 sm:space-y-4">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-2 sm:p-3 rounded-lg ${getAccountTypeColor(account.type)}`}>
                    {getAccountIcon(account.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {account.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {getAccountTypeLabel(account.type)}
                    </p>
                    {account.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {account.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`font-bold text-sm sm:text-lg ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatAmount(account.balance, account.currency)}
                    </p>
                    <p className="text-xs text-gray-500">{account.currency}</p>
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setEditingAccount(account)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
                      title="Edit account"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(account.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                      title="Delete account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Wallet className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              Add your first account to start tracking your finances
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add Your First Account
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Account Form */}
      {(showForm || editingAccount) && (
        <AccountForm
          account={editingAccount || undefined}
          onSubmit={editingAccount ? handleEditAccount : handleAddAccount}
          onClose={() => {
            setShowForm(false);
            setEditingAccount(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this account? This action cannot be undone.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAccount(showDeleteConfirm)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto touch-manipulation"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
