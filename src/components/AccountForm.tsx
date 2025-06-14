import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Account } from '../types';

interface AccountFormProps {
  account?: Account;
  onSubmit: (account: Omit<Account, 'id'>) => void;
  onClose: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'savings' as Account['type'],
    balance: 0,
    currency: 'SGD',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type === 'checking' ? 'savings' : account.type,
        balance: account.balance,
        currency: account.currency,
        description: account.description || ''
      });
    }
  }, [account]);

  const accountTypes = [
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment/Brokerage' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    if (formData.name.length > 50) {
      newErrors.name = 'Account name must be less than 50 characters';
    }

    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    if (isNaN(formData.balance)) {
      newErrors.balance = 'Balance must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {account ? 'Edit Account' : 'Add New Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Account Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., DBS Savings, POSB Investment"
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Account Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as Account['type'])}
              className="input-field"
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`input-field resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Optional notes about this account..."
              rows={3}
              maxLength={200}
            />
            {errors.description && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Balance */}
          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
              Current Balance *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">$</span>
              </div>
              <input
                type="number"
                id="balance"
                value={formData.balance}
                onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                className={`input-field pl-8 ${errors.balance ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            {errors.balance && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.balance}</p>
            )}
            {formData.type === 'credit' && (
              <p className="mt-1 text-xs text-gray-500">
                💡 For credit cards, enter negative values for debt (e.g., -2500)
              </p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="input-field"
            >
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
            >
              {account ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
