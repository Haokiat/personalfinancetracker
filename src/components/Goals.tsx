import React, { useState } from 'react';
import { Plus, Target, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Goal } from '../types';
import GoalForm from './GoalForm';
import ContributeModal from './ContributeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goalId: string, contributionAmount: number) => void;
  onEditGoal: (goalId: string, updatedGoal: Omit<Goal, 'id'>) => void;
  onDeleteGoal: (goalId: string) => void;
}

const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onUpdateGoal, onEditGoal, onDeleteGoal }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (progress >= 75) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (progress >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleFormSubmit = (goalData: Omit<Goal, 'id'>) => {
    if (editingGoal) {
      onEditGoal(editingGoal.id, goalData);
      setEditingGoal(null);
    } else {
      onAddGoal(goalData);
    }
    setShowForm(false);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          const daysRemaining = getDaysRemaining(goal.deadline);
          const isOverdue = daysRemaining < 0;
          const isCompleted = progress >= 100;

          return (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-500">{goal.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {isCompleted && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                      Completed
                    </span>
                  )}
                  <button
                    onClick={() => handleEditGoal(goal)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Goal"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingGoal(goal)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{progress.toFixed(1)}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current</span>
                  <span className="font-semibold text-gray-900">${goal.currentAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Target</span>
                  <span className="font-semibold text-gray-900">${goal.targetAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="font-semibold text-blue-600">${remaining.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                    </span>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => setContributingGoal(goal)}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center space-x-1"
                    >
                      <DollarSign className="h-3 w-3" />
                      <span>Contribute</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-6">
              Set your first financial goal to start working towards your dreams and aspirations.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Goal
            </button>
          </div>
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <GoalForm
          goal={editingGoal}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {/* Contribute Modal */}
      {contributingGoal && (
        <ContributeModal
          goal={contributingGoal}
          onContribute={(amount) => {
            onUpdateGoal(contributingGoal.id, amount);
            setContributingGoal(null);
          }}
          onClose={() => setContributingGoal(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingGoal && (
        <DeleteConfirmationModal
          title="Delete Goal"
          message={`Are you sure you want to delete "${deletingGoal.title}"? This action cannot be undone.`}
          onConfirm={() => {
            onDeleteGoal(deletingGoal.id);
            setDeletingGoal(null);
          }}
          onCancel={() => setDeletingGoal(null)}
        />
      )}
    </div>
  );
};

export default Goals;
