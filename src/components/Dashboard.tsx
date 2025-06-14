import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Wallet, CreditCard, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction, Budget, Goal, Account } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  accounts?: Account[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets, goals, accounts = [] }) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);
  const [showAccountBreakdown, setShowAccountBreakdown] = useState(false);

  // Mock accounts data if none provided
  const mockAccounts: Account[] = [
    { id: '1', name: 'DBS Checking', type: 'checking', balance: 15000, currency: 'SGD' },
    { id: '2', name: 'POSB Savings', type: 'savings', balance: 45000, currency: 'SGD' },
    { id: '3', name: 'Tiger Brokers', type: 'investment', balance: 25000, currency: 'SGD' },
    { id: '4', name: 'UOB Credit Card', type: 'credit', balance: -2500, currency: 'SGD' },
  ];

  const activeAccounts = accounts.length > 0 ? accounts : mockAccounts;

  const totalBalance = activeAccounts.reduce((sum, account) => sum + account.balance, 0);
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
  const accountsByType = activeAccounts.reduce((acc, account) => {
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
    <div className="space-y-6">
      {/* Privacy Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {showSensitiveInfo ? (
            <>
              <EyeOff className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Hide Amounts</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Show Amounts</span>
            </>
          )}
        </button>
      </div>

      {/* Total Balance Card - Full Width with Light Blue */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sky-100 text-sm font-medium mb-2">Total Balance</p>
            <p className="text-4xl font-bold">{formatAmount(totalBalance)}</p>
            <p className="text-sky-100 text-sm mt-2">Across all accounts</p>
          </div>
          <div className="bg-white/20 p-4 rounded-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
        </div>
        
        {/* Account Breakdown Dropdown */}
        <div className="mt-6">
          <button
            onClick={() => setShowAccountBreakdown(!showAccountBreakdown)}
            className="flex items-center space-x-2 text-sky-100 hover:text-white transition-colors"
          >
            <span className="text-sm font-medium">Account Breakdown</span>
            {showAccountBreakdown ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {showAccountBreakdown && (
            <div className="mt-4 space-y-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              {['brokerage', 'savings', 'others'].map((type) => {
                const typeAccounts = accountsByType[type] || [];
                const typeTotal = getAccountTypeTotal(type);
                
                if (typeAccounts.length === 0) return null;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getAccountTypeIcon(type)}</span>
                        <span className="text-sm font-medium text-white capitalize">
                          {type === 'brokerage' ? 'Brokerage Accounts' : 
                           type === 'savings' ? 'Savings Accounts' : 'Other Accounts'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {formatAmount(typeTotal)}
                      </span>
                    </div>
                    
                    <div className="ml-8 space-y-1">
                      {typeAccounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between text-xs">
                          <span className="text-sky-100">{account.name}</span>
                          <span className="text-sky-100">{formatAmount(account.balance)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Other Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">{formatAmount(monthlyIncome)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatAmount(monthlyExpenses)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(netIncome)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <CreditCard className={`h-4 w-4 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400">Add your first transaction to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {activeGoals.length > 0 ? (
                activeGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{goal.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">
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
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No goals set yet</p>
                  <p className="text-sm text-gray-400">Create your first financial goal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        </div>
        <div className="p-6">
          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.slice(0, 6).map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                const isOverBudget = percentage > 100;
                return (
                  <div key={budget.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{budget.category}</span>
                      <span className={`text-sm font-semibold ${
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
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No budgets created yet</p>
              <p className="text-sm text-gray-400">Set up your first budget to track spending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
