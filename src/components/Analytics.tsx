import React from 'react';
import { TrendingUp, PieChart, BarChart3, Calendar } from 'lucide-react';
import { Transaction } from '../types';

interface AnalyticsProps {
  transactions: Transaction[];
}

const Analytics: React.FC<AnalyticsProps> = ({ transactions }) => {
  // Calculate monthly data
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  // Calculate category breakdown
  const getCategoryBreakdown = () => {
    const categoryData: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
      });
    
    return Object.entries(categoryData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryBreakdown();
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Calculate max values for chart scaling
  const maxMonthlyAmount = Math.max(
    ...monthlyData.flatMap(([, data]) => [data.income, data.expenses])
  );

  const maxCategoryAmount = Math.max(...categoryData.map(([, amount]) => amount));

  const getBarHeight = (amount: number, max: number) => {
    return Math.max((amount / max) * 200, 4); // Minimum 4px height
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600">Insights into your financial patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {savingsRate.toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${savingsRate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <PieChart className={`h-6 w-6 ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
            </div>
          </div>
          <div className="p-6">
            {monthlyData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Income vs Expenses (Last 6 Months)</span>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span>Income</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                      <span>Expenses</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between space-x-2 h-48">
                  {monthlyData.map(([month, data]) => (
                    <div key={month} className="flex-1 flex flex-col items-center space-y-1">
                      <div className="w-full flex justify-center space-x-1">
                        <div
                          className="bg-green-500 rounded-t w-4"
                          style={{ height: `${getBarHeight(data.income, maxMonthlyAmount)}px` }}
                        ></div>
                        <div
                          className="bg-red-500 rounded-t w-4"
                          style={{ height: `${getBarHeight(data.expenses, maxMonthlyAmount)}px` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 transform -rotate-45 origin-center">
                        {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
            </div>
          </div>
          <div className="p-6">
            {categoryData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No expense data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryData.map(([category, amount], index) => {
                  const percentage = (amount / totalExpenses) * 100;
                  const colors = [
                    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
                    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
                  ];
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`}></div>
                          <span className="text-sm font-medium text-gray-900">{category}</span>
                        </div>
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
                          className={`h-2 rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.type === 'income').length}
              </p>
              <p className="text-sm text-gray-600">Income Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.type === 'expense').length}
              </p>
              <p className="text-sm text-gray-600">Expense Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                ${transactions.length > 0 ? (transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length).toFixed(0) : '0'}
              </p>
              <p className="text-sm text-gray-600">Average Transaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
