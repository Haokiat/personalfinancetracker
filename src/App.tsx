import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Goals from './components/Goals';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import AccountManagement from './components/AccountManagement';
import { Transaction, Budget, Goal, Account } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', [
    { id: '1', name: 'DBS Savings', type: 'savings', balance: 15000, currency: 'SGD', description: 'Primary savings account for daily expenses' },
    { id: '2', name: 'POSB Savings', type: 'savings', balance: 45000, currency: 'SGD', description: 'Emergency fund and long-term savings' },
    { id: '3', name: 'Tiger Brokers', type: 'investment', balance: 25000, currency: 'SGD', description: 'Stock and ETF investments' },
    { id: '4', name: 'UOB Credit Card', type: 'credit', balance: -2500, currency: 'SGD', description: 'Monthly credit card expenses' },
  ]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    
    // Update budget spending
    updateBudgetSpending(updatedTransactions);
  };

  const updateTransaction = (id: string, updatedTransaction: Omit<Transaction, 'id'>) => {
    const updatedTransactions = transactions.map(t => 
      t.id === id ? { ...updatedTransaction, id } : t
    );
    setTransactions(updatedTransactions);
    
    // Update budget spending
    updateBudgetSpending(updatedTransactions);
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    
    // Update budget spending
    updateBudgetSpending(updatedTransactions);
  };

  const updateBudgetSpending = (currentTransactions: Transaction[]) => {
    const updatedBudgets = budgets.map(budget => {
      const spent = currentTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return { ...budget, spent };
    });
    
    setBudgets(updatedBudgets);
  };

  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      spent,
    };
    setBudgets([...budgets, newBudget]);
  };

  const editBudget = (budgetId: string, updatedBudget: Omit<Budget, 'id' | 'spent'>) => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === updatedBudget.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const updatedBudgets = budgets.map(budget =>
      budget.id === budgetId ? { ...updatedBudget, id: budgetId, spent } : budget
    );
    setBudgets(updatedBudgets);
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter(budget => budget.id !== budgetId));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
    };
    setGoals([...goals, newGoal]);
  };

  const editGoal = (goalId: string, updatedGoal: Omit<Goal, 'id'>) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...updatedGoal, id: goalId } : goal
    );
    setGoals(updatedGoals);
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  // Account management functions
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };
    setAccounts([...accounts, newAccount]);
  };

  const editAccount = (accountId: string, updatedAccount: Omit<Account, 'id'>) => {
    const updatedAccounts = accounts.map(account =>
      account.id === accountId ? { ...updatedAccount, id: accountId } : account
    );
    setAccounts(updatedAccounts);
  };

  const deleteAccount = (accountId: string) => {
    setAccounts(accounts.filter(account => account.id !== accountId));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} budgets={budgets} goals={goals} accounts={accounts} />;
      case 'add-transaction':
        return <TransactionForm onSubmit={addTransaction} onClose={() => setActiveTab('dashboard')} />;
      case 'transactions':
        return (
          <Transactions 
            transactions={transactions} 
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        );
      case 'budgets':
        return (
          <Budgets 
            budgets={budgets} 
            transactions={transactions}
            onAddBudget={addBudget}
            onEditBudget={editBudget}
            onDeleteBudget={deleteBudget}
          />
        );
      case 'goals':
        return (
          <Goals 
            goals={goals}
            onAddGoal={addGoal}
            onEditGoal={editGoal}
            onDeleteGoal={deleteGoal}
          />
        );
      case 'accounts':
        return (
          <AccountManagement
            accounts={accounts}
            onAddAccount={addAccount}
            onEditAccount={editAccount}
            onDeleteAccount={deleteAccount}
          />
        );
      case 'analytics':
        return <Analytics transactions={transactions} budgets={budgets} goals={goals} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard transactions={transactions} budgets={budgets} goals={goals} accounts={accounts} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
