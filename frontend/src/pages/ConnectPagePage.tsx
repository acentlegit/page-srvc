import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { pagesApi } from '../api/apiClient';

export default function ConnectPagePage() {
  const navigate = useNavigate();
  const [pageId, setPageId] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleConnect = async () => {
    if (!pageId || !pageId.trim()) {
      setError('Please enter a page ID.');
      return;
    }

    if (!userId || !userId.trim()) {
      setError('Please enter a user ID.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await pagesApi.connectPage(pageId.trim(), {
        userId: userId.trim(),
        role: role
      });
      
      setResponse(result);
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to connect page:', err);
      setError(err.message || 'Failed to connect page');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <PageHeader title="Connect Page" />

      {error && !success && (
        <div style={{ padding: 16, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: 16, background: '#d4edda', color: '#155724', borderRadius: 6, marginBottom: 16 }}>
          User connected to page successfully!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div className="small-label">Page ID</div>
          <input 
            className="input" 
            value={pageId} 
            onChange={(e) => setPageId(e.target.value)} 
            placeholder="Enter page ID (e.g., 1, 2, 3...)" 
            disabled={loading}
          />
        </div>
        <div>
          <div className="small-label">User ID</div>
          <input 
            className="input" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)} 
            placeholder="Enter user ID" 
            disabled={loading}
          />
        </div>
        <div>
          <div className="small-label">Role</div>
          <select 
            className="select" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
            <option value="Owner">Owner</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleConnect} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect User to Page'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/communication/pages')}>
          Back to Pages
        </button>
      </div>

      {/* Display JSON response */}
      {response && (
        <div style={{
          marginTop: 20,
          padding: 16,
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: 6,
        }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>API Response:</div>
          <pre style={{
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
