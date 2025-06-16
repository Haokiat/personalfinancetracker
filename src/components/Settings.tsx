import React, { useState, useEffect } from 'react';
import { User, Download, Upload, Database, AlertCircle, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    currency: 'SGD',
  });

  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [backupReminder, setBackupReminder] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Load last backup date from localStorage
    const savedLastBackup = localStorage.getItem('lastBackupDate');
    setLastBackupDate(savedLastBackup);

    // Check if backup is needed
    if (savedLastBackup) {
      const lastBackup = new Date(savedLastBackup);
      const now = new Date();
      const monthsSinceLastBackup = (now.getFullYear() - lastBackup.getFullYear()) * 12 + 
                                   (now.getMonth() - lastBackup.getMonth());
      
      setBackupReminder(monthsSinceLastBackup >= 1);
    } else {
      setBackupReminder(true);
    }
  }, []);

  const handleProfileUpdate = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    // Save profile to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    // Show success message
    setSaveMessage('Changes are saved');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSaveMessage('');
    }, 3000);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
  };

  const exportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
      goals: JSON.parse(localStorage.getItem('goals') || '[]'),
      accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
      profile,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update last backup date
    const currentDate = new Date().toISOString();
    localStorage.setItem('lastBackupDate', currentDate);
    setLastBackupDate(currentDate);
    setBackupReminder(false);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate the data structure
        if (!data.transactions || !data.budgets || !data.goals || !data.accounts) {
          throw new Error('Invalid backup file format');
        }

        // Restore the data
        localStorage.setItem('transactions', JSON.stringify(data.transactions));
        localStorage.setItem('budgets', JSON.stringify(data.budgets));
        localStorage.setItem('goals', JSON.stringify(data.goals));
        localStorage.setItem('accounts', JSON.stringify(data.accounts));
        
        // Restore profile if it exists
        if (data.profile) {
          setProfile(data.profile);
          localStorage.setItem('userProfile', JSON.stringify(data.profile));
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: data.profile }));
        }

        alert('Data restored successfully! Please refresh the page to see the changes.');
      } catch (error) {
        alert('Error restoring data: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account preferences and app settings</p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">{saveMessage}</span>
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleProfileUpdate('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileUpdate('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={profile.currency}
                onChange={(e) => handleProfileUpdate('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SGD">SGD - Singapore Dollar</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Database className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Backup Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Backup Status</h4>
              {backupReminder && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Backup recommended</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {lastBackupDate 
                ? `Last backup: ${formatDate(lastBackupDate)}`
                : 'No backup created yet'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Backup Your Data</h4>
              <p className="text-sm text-gray-600 mb-4">
                Export your data to a JSON file. Keep this file safe as it contains all your financial information.
                We recommend creating a backup at least once a month.
              </p>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Restore Your Data</h4>
              <p className="text-sm text-gray-600 mb-4">
                Import your previously exported data file to restore your information.
              </p>
              <label className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSaveChanges}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
