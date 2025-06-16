import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  Target, 
  BarChart3, 
  Settings,
  Menu,
  X,
  User,
  Wallet
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    currency: 'SGD',
  });

  useEffect(() => {
    // Load profile from localStorage on component mount
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      setProfile(event.detail);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', name: 'Transactions', icon: CreditCard },
    { id: 'accounts', name: 'Accounts', icon: Wallet },
    { id: 'budgets', name: 'Budgets', icon: PiggyBank },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Auto-close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors touch-manipulation"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  Chicken Rice Finance
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Mobile Optimized */}
        <nav className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed md:relative md:translate-x-0
          w-64 bg-white shadow-lg md:shadow-sm 
          min-h-screen transition-transform duration-300 ease-in-out
          z-40 md:z-auto
          ${!sidebarOpen && 'md:w-0 md:overflow-hidden'}
        `}>
          <div className="p-4">
            {/* User Profile Preview - Mobile Optimized */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{profile.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation - Mobile Optimized */}
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap touch-manipulation ${
                        activeTab === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content - Mobile Optimized */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 min-w-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
