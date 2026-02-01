import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import FamilyTreeChart from './components/FamilyTreeChart';
import FamilyMembers from './components/FamilyMembers';
import { useAuth } from './context/AuthContext';
import { getAuthHeaders } from './context/AuthContext';

const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, username, isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchFamilyTree = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/tree`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTreeData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching family tree:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMemberChange = () => {
    fetchFamilyTree();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && !treeData) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Family Tree</h1>
          <div className="loading">Loading family tree...</div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-title">
          <h1>Family Tree</h1>
          <p className="subtitle">Manage and visualize your family tree</p>
        </div>
        <div className="header-right">
          <span className="header-user">{username}</span>
          {isAdmin && (
            <Link to="/admin" className="btn-admin">Admin</Link>
          )}
          <Link to="/settings" className="btn-settings">Settings</Link>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Family Members
        </button>
      </div>

      <main className="App-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            {error ? (
              <div className="error">
                <p>Error loading family tree: {error}</p>
                <button onClick={fetchFamilyTree}>Retry</button>
              </div>
            ) : (
              treeData && <FamilyTreeChart data={treeData} />
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-tab">
            <FamilyMembers onMemberChange={handleMemberChange} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
