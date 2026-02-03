import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { pagesApi } from '../api/apiClient';

export default function DisconnectPagePage() {
  const navigate = useNavigate();
  const [pageId, setPageId] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleDisconnect = async () => {
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
      
      const result = await pagesApi.disconnectPage(pageId.trim(), {
        userId: userId.trim()
      });
      
      setResponse(result);
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to disconnect page:', err);
      setError(err.message || 'Failed to disconnect page');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <PageHeader title="Disconnect Page" />

      {error && !success && (
        <div style={{ padding: 16, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: 16, background: '#d4edda', color: '#155724', borderRadius: 6, marginBottom: 16 }}>
          User disconnected from page successfully!
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
            placeholder="Enter user ID to disconnect" 
            disabled={loading}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleDisconnect} disabled={loading}>
          {loading ? 'Disconnecting...' : 'Disconnect User from Page'}
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
