import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Settings from './pages/Settings';

const PAGES = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  categories: 'Categories',
  settings: 'Settings'
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (window.api?.getEmail) {
      window.api.getEmail().then((value) => setEmail(value));
    }
  }, []);

  const handleEmailConnect = async (newEmail) => {
    if (!newEmail) return;
    if (window.api?.setEmail) {
      await window.api.setEmail(newEmail);
    }
    setEmail(newEmail);
  };

  let content = null;
  switch (activePage) {
    case 'transactions':
      content = <Transactions />;
      break;
    case 'categories':
      content = <Categories />;
      break;
    case 'settings':
      content = <Settings email={email} onEmailChange={handleEmailConnect} />;
      break;
    case 'dashboard':
    default:
      content = <Dashboard email={email} onEmailConnect={handleEmailConnect} />;
  }

  return (
    <div className="flex h-screen bg-background text-text">
      <Sidebar activePage={activePage} onChangePage={setActivePage} />
      <main className="flex-1 p-6 overflow-y-auto">
        {content}
      </main>
    </div>
  );
}

export default App;

