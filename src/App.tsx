import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Transaction, Budget, Goal, Account } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Goals from './components/Goals';
import Analytics from './components/Analytics';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sample data for demonstration
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', [
    {
      id: '1',
      type: 'income',
      amount: 5000,
      category: 'Salary',
      description: 'Monthly Salary',
      date: '2024-01-15',
      recurring: true,
    },
    {
      id: '2',
      type: 'expense',
      amount: 1200,
      category: 'Housing',
      description: 'Rent Payment',
      date: '2024-01-01',
      recurring: true,
    },
    {
      id: '3',
      type: 'expense',
      amount: 450,
      category: 'Food',
      description: 'Groceries',
      date: '2024-01-10',
    },
    {
      id: '4',
      type: 'expense',
      amount: 80,
      category: 'Transportation',
      description: 'Gas',
      date: '2024-01-12',
    },
    {
      id: '5',
      type: 'income',
      amount: 800,
      category: 'Freelance',
      description: 'Web Design Project',
      date: '2024-01-20',
    },
  ]);

  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', [
    {
      id: '1',
      category: 'Food',
      limit: 600,
      spent: 450,
      period: 'monthly',
    },
    {
      id: '2',
      category: 'Transportation',
      limit: 200,
      spent: 80,
      period: 'monthly',
    },
    {
      id: '3',
      category: 'Entertainment',
      limit: 300,
      spent: 120,
      period: 'monthly',
    },
    {
      id: '4',
      category: 'Shopping',
      limit: 400,
      spent: 380,
      period: 'monthly',
    },
  ]);

  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', [
    {
      id: '1',
      title: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 3500,
      deadline: '2024-12-31',
      category: 'Emergency Fund',
    },
    {
      id: '2',
      title: 'Vacation to Europe',
      targetAmount: 5000,
      currentAmount: 1200,
      deadline: '2024-08-15',
      category: 'Vacation',
    },
    {
      id: '3',
      title: 'New Car Down Payment',
      targetAmount: 8000,
      currentAmount: 2800,
      deadline: '2024-10-01',
      category: 'Car',
    },
  ]);

  const [accounts] = useLocalStorage<Account[]>('accounts', [
    {
      id: '1',
      name: 'Checking Account',
      type: 'checking',
      balance: 4500,
      currency: 'USD',
    },
    {
      id: '2',
      name: 'Savings Account',
      type: 'savings',
      balance: 12000,
      currency: 'USD',
    },
    {
      id: '3',
      name: 'Credit Card',
      type: 'credit',
      balance: -850,
      currency: 'USD',
    },
  ]);

  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [transaction, ...prev]);

    // Update budget spent amount if it's an expense
    if (transaction.type === 'expense') {
      setBudgets(prev => prev.map(budget => 
        budget.category === transaction.category
          ? { ...budget, spent: budget.spent + transaction.amount }
          : budget
      ));
    }
  };

  const addBudget = (newBudget: Omit<Budget, 'id' | 'spent'>) => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === newBudget.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const budget: Budget = {
      ...newBudget,
      id: Date.now().toString(),
      spent,
    };
    setBudgets(prev => [...prev, budget]);
  };

  const addGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Date.now().toString(),
    };
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (goalId: string, contributionAmount: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId
        ? { ...goal, currentAmount: goal.currentAmount + contributionAmount }
        : goal
    ));
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            accounts={accounts}
          />
        );
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            onAddTransaction={addTransaction}
          />
        );
      case 'budgets':
        return (
          <Budgets
            budgets={budgets}
            transactions={transactions}
            onAddBudget={addBudget}
          />
        );
      case 'goals':
        return (
          <Goals
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
          />
        );
      case 'analytics':
        return <Analytics transactions={transactions} />;
      default:
        return (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            accounts={accounts}
          />
        );
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
}

export default App;
