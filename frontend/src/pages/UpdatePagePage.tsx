import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { pagesApi, PageModel } from '../api/apiClient';

export default function UpdatePagePage() {
  const navigate = useNavigate();
  const [pageId, setPageId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userInput, setUserInput] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState<any>(null);

  // Load page data when pageId is entered
  useEffect(() => {
    if (pageId && pageId.trim()) {
      loadPageData(pageId.trim());
    }
  }, [pageId]);

  const loadPageData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const page = await pagesApi.get(id);
      setName(page.name || '');
      setDescription(page.content?.heroTitle || page.content || '');
      setUsers(page.members?.map((m: any) => m.userId || m) || []);
    } catch (err: any) {
      console.error('Failed to load page:', err);
      setError('Page not found. You can still update it with new data.');
    } finally {
      setLoading(false);
    }
  };

  const addUser = () => {
    const trimmed = userInput.trim();
    if (!trimmed) return;
    if (users.includes(trimmed)) return;
    setUsers((prev) => [...prev, trimmed]);
    setUserInput('');
  };

  const removeUser = (email: string) => {
    setUsers((prev) => prev.filter((u) => u !== email));
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a page name.');
      return;
    }

    if (!pageId || !pageId.trim()) {
      setError('Please enter a page ID.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const members = users.map(email => ({ userId: email, role: 'Member' as const }));
      
      const result = await pagesApi.update(pageId.trim(), {
        name: trimmedName,
        members,
        content: description ? { heroTitle: description, sections: [], ctas: [] } : undefined,
      });
      
      setResponse(result);
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to update page:', err);
      setError(err.message || 'Failed to update page');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <PageHeader title="Update Page" />

      {error && !success && (
        <div style={{ padding: 16, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: 16, background: '#d4edda', color: '#155724', borderRadius: 6, marginBottom: 16 }}>
          Page updated successfully!
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
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Enter the page ID to load existing data
          </div>
        </div>
        <div>
          <div className="small-label">Page Name</div>
          <input 
            className="input" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Team Chat" 
            disabled={loading}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="small-label">Description</div>
          <input
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short summary about this page"
            disabled={loading}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="small-label">Add Users (email)</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="name@company.com"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUser();
              }
            }}
          />
          <button className="btn btn-secondary" onClick={addUser} disabled={loading}>
            Add
          </button>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {users.map((email) => (
            <span
              key={email}
              style={{
                padding: '6px 10px',
                borderRadius: 20,
                background: '#f1f3f5',
                border: '1px solid #e6e6e6',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {email}
              <button
                onClick={() => removeUser(email)}
                disabled={loading}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Updating...' : 'Update Page'}
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
