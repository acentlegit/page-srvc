import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { pagesApi } from '../api/apiClient';

export default function SyncPagePage() {
  const navigate = useNavigate();
  const [pageId, setPageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSync = async () => {
    if (!pageId || !pageId.trim()) {
      setError('Please enter a page ID.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await pagesApi.syncPage(pageId.trim(), { sync: true });
      
      setResponse(result);
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to sync page:', err);
      setError(err.message || 'Failed to sync page');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <PageHeader title="Sync Page" />

      {error && !success && (
        <div style={{ padding: 16, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: 16, background: '#d4edda', color: '#155724', borderRadius: 6, marginBottom: 16 }}>
          Page synced successfully!
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div className="small-label">Page ID</div>
        <input 
          className="input" 
          value={pageId} 
          onChange={(e) => setPageId(e.target.value)} 
          placeholder="Enter page ID (e.g., 1, 2, 3...)" 
          disabled={loading}
        />
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Enter the page ID to sync
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleSync} disabled={loading}>
          {loading ? 'Syncing...' : 'Sync Page'}
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
