import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Wallet, CreditCard, Eye, EyeOff, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Transaction, Budget, Goal, Account } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  accounts: Account[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets, goals, accounts }) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);
  const [showAccountBreakdown, setShowAccountBreakdown] = useState(false);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);
  const netIncome = monthlyIncome - monthlyExpenses;

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const activeGoals = goals.slice(0, 3);

  const formatAmount = (amount: number) => {
    return showSensitiveInfo ? `$${amount.toLocaleString()}` : '••••••';
  };

  // Group accounts by type
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.type === 'investment' ? 'brokerage' : 
                 account.type === 'savings' ? 'savings' : 'others';
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  const getAccountTypeTotal = (type: string) => {
    return accountsByType[type]?.reduce((sum, account) => sum + account.balance, 0) || 0;
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'brokerage': return '📈';
      case 'savings': return '🏦';
      default: return '💳';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Privacy Toggle - Mobile Optimized */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
          className="flex items-center space-x-2 px-3 py-2 sm:px-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation"
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
      </div>

      {/* Total Balance Card - Mobile Optimized */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
            <p className="text-sky-100 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Balance</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold break-all">{formatAmount(totalBalance)}</p>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 sm:mt-2">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-white/20 p-3 sm:p-4 rounded-lg self-start sm:self-auto">
            <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
        </div>
        
        {/* Account Breakdown Dropdown - Mobile Optimized */}
        {accounts.length > 0 && (
          <div className="mt-4 sm:mt-6">
            <button
              onClick={() => setShowAccountBreakdown(!showAccountBreakdown)}
              className="flex items-center space-x-2 text-sky-100 hover:text-white transition-colors touch-manipulation"
            >
              <span className="text-xs sm:text-sm font-medium">Account Breakdown</span>
              {showAccountBreakdown ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {showAccountBreakdown && (
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                {['brokerage', 'savings', 'others'].map((type) => {
                  const typeAccounts = accountsByType[type] || [];
                  const typeTotal = getAccountTypeTotal(type);
                  
                  if (typeAccounts.length === 0) return null;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-base sm:text-lg">{getAccountTypeIcon(type)}</span>
                          <span className="text-xs sm:text-sm font-medium text-white capitalize">
                            {type === 'brokerage' ? 'Brokerage' : 
                             type === 'savings' ? 'Savings' : 'Others'}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {formatAmount(typeTotal)}
                        </span>
                      </div>
                      
                      <div className="ml-6 sm:ml-8 space-y-1">
                        {typeAccounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between text-xs">
                            <span className="text-sky-100 truncate pr-2">{account.name}</span>
                            <span className="text-sky-100 flex-shrink-0">{formatAmount(account.balance)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* No Accounts State */}
        {accounts.length === 0 && (
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sky-100 text-sm mb-3">No accounts added yet</p>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation">
              <Plus className="h-4 w-4 inline mr-2" />
              Add Your First Account
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Monthly Income</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 truncate">{formatAmount(monthlyIncome)}</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg ml-2">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Monthly Expenses</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 truncate">{formatAmount(monthlyExpenses)}</p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-lg ml-2">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Net Income</p>
              <p className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(netIncome)}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg ml-2 ${netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-5 w-5 sm:h-6 sm:w-6 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-6">
        {/* Recent Transactions - Full Width on Mobile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <CreditCard className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{transaction.description}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold text-sm sm:text-base ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No transactions yet</p>
                  <p className="text-xs sm:text-sm text-gray-400">Add your first transaction to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals Progress - Full Width on Mobile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Financial Goals</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {activeGoals.length > 0 ? (
                activeGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-2 space-x-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                          <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{goal.title}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                          {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{progress.toFixed(1)}% complete</span>
                        <span className="text-xs text-gray-500">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Target className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No goals set yet</p>
                  <p className="text-xs sm:text-sm text-gray-400">Create your first financial goal</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget Overview - Mobile Optimized Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Budget Overview</h3>
          </div>
          <div className="p-4 sm:p-6">
            {budgets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {budgets.slice(0, 6).map((budget) => {
                  const percentage = (budget.spent / budget.limit) * 100;
                  const isOverBudget = percentage > 100;
                  return (
                    <div key={budget.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 text-sm sm:text-base truncate pr-2">{budget.category}</span>
                        <span className={`text-xs sm:text-sm font-semibold flex-shrink-0 ${
                          isOverBudget ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {formatAmount(budget.spent)} / {formatAmount(budget.limit)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isOverBudget 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : 'bg-gradient-to-r from-green-500 to-green-600'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-xs font-medium ${
                          isOverBudget ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{budget.period}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No budgets created yet</p>
                <p className="text-xs sm:text-sm text-gray-400">Set up your first budget to track spending</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
