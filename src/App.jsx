import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Votes from './pages/Votes';
import Vault from './pages/Vault';
import Admin from './pages/Admin';
import Funding from './pages/Funding';
import PillarDetails from './pages/PillarDetails';
import { useState, useEffect } from 'react';

// Simple routing logic (can use react-router for larger scale)
const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pillarId, setPillarId] = useState(null);

  // Handle simple routing based on URL hash or state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';

      if (hash.startsWith('pillar/')) {
        const id = hash.split('/')[1];
        setActiveTab('pillar');
        setPillarId(id);
      } else if (hash.startsWith('proposals')) {
        setActiveTab('proposals');
        setPillarId(null);
      } else {
        setActiveTab(hash);
        setPillarId(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-gold border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'funding': return <Funding />;
      case 'proposals': return <Votes />;
      case 'vault': return <Vault />;
      case 'admin': return <Admin />;
      case 'pillar': return <PillarDetails pillarId={pillarId} />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
