import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import { Transaction, Budget, Goal } from '../types';

interface AnalyticsProps {
  transactions: Transaction[];
  budgets?: Budget[];
  goals?: Goal[];
}

const Analytics: React.FC<AnalyticsProps> = ({ transactions, budgets = [], goals = [] }) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Monthly data for the current year
  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === index && date.getFullYear() === currentYear;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: new Date(currentYear, index).toLocaleDateString('en-US', { month: 'short' }),
      income,
      expenses,
      net: income - expenses,
    };
  });

  // Category breakdown for current month
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const categoryBreakdown = currentMonthTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { income: 0, expense: 0, total: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[category].income += transaction.amount;
    } else {
      acc[category].expense += transaction.amount;
    }
    
    acc[category].total = acc[category].income - acc[category].expense;
    return acc;
  }, {} as Record<string, { income: number; expense: number; total: number }>);

  // Current month totals
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthNet = currentMonthIncome - currentMonthExpenses;

  // Top spending categories
  const topSpendingCategories = Object.entries(categoryBreakdown)
    .filter(([_, data]) => data.expense > 0)
    .sort(([_, a], [__, b]) => b.expense - a.expense)
    .slice(0, 5);

  // Budget performance
  const budgetPerformance = budgets.map(budget => ({
    ...budget,
    percentage: budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0,
    remaining: budget.limit - budget.spent,
  }));

  const formatAmount = (amount: number) => {
    if (!showSensitiveInfo) return '••••••';
    return `SGD ${Math.abs(amount).toLocaleString('en-SG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Insights into your spending patterns and financial trends
          </p>
        </div>
        
        {/* Privacy Toggle */}
        <button
          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
          className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation self-start sm:self-auto"
        >
          {showSensitiveInfo ? (
            <>
              <EyeOff className="h-4 w-4 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-600">Hide Amounts</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-600">Show Amounts</span>
            </>
          )}
        </button>
      </div>

      {/* Current Month Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">This Month Income</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {formatAmount(currentMonthIncome)}
              </p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">This Month Expenses</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">
                {formatAmount(currentMonthExpenses)}
              </p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
              <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Net This Month</p>
              <p className={`text-lg sm:text-2xl font-bold ${
                currentMonthNet >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentMonthNet >= 0 ? '+' : '-'}{formatAmount(Math.abs(currentMonthNet))}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg ${
              currentMonthNet >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`h-4 w-4 sm:h-5 sm:w-5 ${
                currentMonthNet >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Monthly Trends ({currentYear})</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {monthlyData.map((data, index) => {
            const maxAmount = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)));
            const incomeWidth = maxAmount > 0 ? (data.income / maxAmount) * 100 : 0;
            const expenseWidth = maxAmount > 0 ? (data.expenses / maxAmount) * 100 : 0;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-gray-700 w-8">{data.month}</span>
                  <div className="flex space-x-4 text-xs">
                    <span className="text-green-600">
                      Income: {showSensitiveInfo ? `SGD ${data.income.toLocaleString()}` : '••••'}
                    </span>
                    <span className="text-red-600">
                      Expenses: {showSensitiveInfo ? `SGD ${data.expenses.toLocaleString()}` : '••••'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex space-x-1">
                    <div className="bg-gray-100 rounded-full h-2 flex-1">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${incomeWidth}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="bg-gray-100 rounded-full h-2 flex-1">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${expenseWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Spending Categories */}
      {topSpendingCategories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Top Spending Categories (This Month)
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {topSpendingCategories.map(([category, data], index) => {
              const maxExpense = topSpendingCategories[0][1].expense;
              const percentage = maxExpense > 0 ? (data.expense / maxExpense) * 100 : 0;

              return (
                <div key={category} className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm font-semibold text-red-600">
                        {formatAmount(data.expense)}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget Performance */}
      {budgetPerformance.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Budget Performance</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {budgetPerformance.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {showSensitiveInfo ? `${formatAmount(budget.spent)} / ${formatAmount(budget.limit)}` : '••••• / •••••'}
                    </span>
                    <p className="text-xs text-gray-500">
                      {formatPercentage(budget.percentage)} used
                    </p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      budget.percentage > 100 
                        ? 'bg-red-500' 
                        : budget.percentage > 80 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                {budget.percentage > 100 && (
                  <p className="text-xs text-red-600">
                    Over budget by {formatAmount(Math.abs(budget.remaining))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No data to analyze</h3>
          <p className="text-sm sm:text-base text-gray-500">
            Add some transactions to see your financial analytics and insights
          </p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
