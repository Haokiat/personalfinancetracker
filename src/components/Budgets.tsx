import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Budget, Transaction } from '../types';
import BudgetForm from './BudgetForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  onEditBudget: (budgetId: string, updatedBudget: Omit<Budget, 'id' | 'spent'>) => void;
  onDeleteBudget: (budgetId: string) => void;
}

const Budgets: React.FC<BudgetsProps> = ({ budgets, transactions, onAddBudget, onEditBudget, onDeleteBudget }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage >= 100) return 'over';
    if (percentage >= 80) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'over': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'warning': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      default: return 'bg-gradient-to-r from-green-500 to-green-600';
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleFormSubmit = (budgetData: Omit<Budget, 'id' | 'spent'>) => {
    if (editingBudget) {
      onEditBudget(editingBudget.id, budgetData);
      setEditingBudget(null);
    } else {
      onAddBudget(budgetData);
    }
    setShowForm(false);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const status = getBudgetStatus(budget);
          const percentage = (budget.spent / budget.limit) * 100;
          const remaining = budget.limit - budget.spent;

          return (
            <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status === 'over' ? 'Over Budget' : status === 'warning' ? 'Near Limit' : 'On Track'}
                  </span>
                  <button
                    onClick={() => handleEditBudget(budget)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Budget"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingBudget(budget)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="font-semibold text-gray-900">${budget.spent.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Budget</span>
                  <span className="font-semibold text-gray-900">${budget.limit.toLocaleString()}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(status)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{percentage.toFixed(1)}% used</span>
                  <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(remaining).toLocaleString()} {remaining >= 0 ? 'remaining' : 'over'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 capitalize">{budget.period}</span>
                  <div className="flex items-center space-x-1">
                    {status === 'over' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : status === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first budget to start tracking your spending and stay on top of your finances.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Budget
            </button>
          </div>
        </div>
      )}

      {/* Budget Form Modal */}
      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingBudget && (
        <DeleteConfirmationModal
          title="Delete Budget"
          message={`Are you sure you want to delete the "${deletingBudget.category}" budget? This action cannot be undone.`}
          onConfirm={() => {
            onDeleteBudget(deletingBudget.id);
            setDeletingBudget(null);
          }}
          onCancel={() => setDeletingBudget(null)}
        />
      )}
    </div>
  );
};

export default Budgets;
