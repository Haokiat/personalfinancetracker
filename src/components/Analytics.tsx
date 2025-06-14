import React from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { Transaction } from '../types';

interface AnalyticsProps {
  transactions: Transaction[];
}

const Analytics: React.FC<AnalyticsProps> = ({ transactions }) => {
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

  const categoryBreakdown = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalExpenses = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0);

  // Top categories
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Recent trends
  const last6Months = monthlyData.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  const avgMonthlyIncome = last6Months.reduce((sum, month) => sum + month.income, 0) / last6Months.length;
  const avgMonthlyExpenses = last6Months.reduce((sum, month) => sum + month.expenses, 0) / last6Months.length;

  const maxAmount = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{currentYear}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">${avgMonthlyIncome.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">${avgMonthlyExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Monthly Savings</p>
              <p className={`text-2xl font-bold ${avgMonthlyIncome - avgMonthlyExpenses >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${(avgMonthlyIncome - avgMonthlyExpenses).toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <PieChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h3>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600">+${month.income.toLocaleString()}</span>
                    <span className="text-red-600">-${month.expenses.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-1 h-4">
                  <div
                    className="bg-green-500 rounded-l"
                    style={{ width: `${(month.income / maxAmount) * 100}%` }}
                  ></div>
                  <div
                    className="bg-red-500 rounded-r"
                    style={{ width: `${(month.expenses / maxAmount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Spending Categories (This Month)
          </h3>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          ${amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No expense data for this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Spending Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Total Transactions</h4>
            <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Income Transactions</h4>
            <p className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.type === 'income').length}
            </p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Expense Transactions</h4>
            <p className="text-2xl font-bold text-red-600">
              {transactions.filter(t => t.type === 'expense').length}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Recurring Transactions</h4>
            <p className="text-2xl font-bold text-purple-600">
              {transactions.filter(t => t.recurring).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
