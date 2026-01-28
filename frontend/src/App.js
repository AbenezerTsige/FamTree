import React, { useState, useEffect } from 'react';
import './App.css';
import FamilyTreeChart from './components/FamilyTreeChart';
import FamilyMembers from './components/FamilyMembers';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFamilyTree();
  }, []);

  const fetchFamilyTree = async () => {
    try {
      setLoading(true);
      // Use relative URL in production (nginx proxy), full URL in development
      const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');
      const response = await fetch(`${apiUrl}/api/tree`);
      
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

  const handleMemberChange = () => {
    // Refresh the tree when members are added/updated/deleted
    fetchFamilyTree();
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
        <h1>Family Tree</h1>
        <p className="subtitle">Manage and visualize your family tree</p>
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
