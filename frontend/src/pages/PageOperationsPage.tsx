import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { pagesApi } from '../api/apiClient';

export default function PageOperationsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoints = [
    { value: 'createPage', label: 'POST /createPage', description: 'Create a new page' },
    { value: 'searchPage', label: 'POST /searchPage', description: 'Search for pages' },
    { value: 'searchInPage', label: 'POST /searchInPage', description: 'Search within a page' },
    { value: 'updatePage', label: 'POST /updatePage', description: 'Update a page' },
    { value: 'syncPage', label: 'POST /syncPage', description: 'Sync a page' },
    { value: 'connectPage', label: 'POST /connectPage', description: 'Connect to a page' },
    { value: 'disconnectPage', label: 'POST /disconnectPage', description: 'Disconnect from a page' },
    { value: 'searchMessage', label: 'POST /searchMessage', description: 'Search messages' },
    { value: 'disconnect', label: 'POST /disconnect', description: 'Disconnect' },
    { value: 'operatePage', label: 'POST /operatePage', description: 'Operate on a page' },
    { value: 'findUsersToPage', label: 'POST /findUsersToPage', description: 'Find users for a page' },
    { value: 'doBulk', label: 'POST /doBulk', description: 'Perform bulk operations' },
  ];

  const getDefaultRequestBody = (endpoint: string): string => {
    const defaults: Record<string, string> = {
      createPage: JSON.stringify({
        changes: [
          {
            op: 'add',
            path: '/test',
            value: {
              testId: '5ddce664-f3c9-4eb0-9284',
              name: 'Test Page',
              type: 'LiveGroup'
            }
          }
        ],
        objectId: '1'
      }, null, 2),
      searchPage: JSON.stringify({
        select: {
          index: {
            searchIndex: 'beamdev:page:*',
            searchQuery: '*test*',
            searchOptions: 'NOCONTENT'
          }
        },
        pattern: {
          objectIdPattern: '*'
        },
        filter: {
          paths: ['$']
        }
      }, null, 2),
      searchInPage: JSON.stringify({
        select: {
          index: {
            searchIndex: 'beamdev:page:*',
            searchQuery: '*test*',
            searchOptions: 'NOCONTENT'
          }
        },
        pattern: {
          objectIdPattern: '*'
        },
        filter: {
          paths: ['$']
        }
      }, null, 2),
      updatePage: JSON.stringify({
        changes: [
          {
            op: 'add',
            path: '/test',
            value: {
              name: 'Updated Page Name'
            }
          }
        ],
        objectId: '1'
      }, null, 2),
      syncPage: JSON.stringify({
        changes: [
          {
            op: 'add',
            path: '/test',
            value: {
              sync: true
            }
          }
        ],
        objectId: '1'
      }, null, 2),
      connectPage: JSON.stringify({
        changes: [
          {
            op: 'add',
            path: '/test',
            value: {
              userId: '1',
              role: 'Member'
            }
          }
        ],
        objectId: '1'
      }, null, 2),
      disconnectPage: JSON.stringify({
        changes: [
          {
            op: 'add',
            path: '/test',
            value: {
              userId: '1'
            }
          }
        ],
        objectId: '1'
      }, null, 2),
      searchMessage: JSON.stringify({
        select: {
          index: {
            searchIndex: 'beamdev:message:*',
            searchQuery: '*test*',
            searchOptions: 'NOCONTENT'
          }
        },
        pattern: {
          objectIdPattern: '*'
        },
        filter: {
          paths: ['$']
        }
      }, null, 2),
      disconnect: JSON.stringify({
        changes: [
          {
            op: 'add',
            path: '/test',
            value: {
              disconnect: true
            }
          }
        ],
        objectId: '1'
      }, null, 2),
      operatePage: JSON.stringify({
        changes: [
          {
            op: 'add',
            path: '/test',
            value: {
              operation: 'addMember',
              targetUserId: '2',
              targetRole: 'Member',
              actorUserId: '1',
              pageId: '1'
            }
          }
        ],
        objectId: '1'
      }, null, 2),
      findUsersToPage: JSON.stringify({
        select: {
          index: {
            searchIndex: 'beamdev:user:*',
            searchQuery: '*',
            searchOptions: 'NOCONTENT'
          }
        },
        pattern: {
          objectIdPattern: '*'
        },
        filter: {
          paths: ['$']
        }
      }, null, 2),
      doBulk: JSON.stringify({
        operations: [
          {
            op: 'add',
            path: '/test',
            value: { test: 'bulk operation' },
            objectId: '1'
          }
        ]
      }, null, 2),
    };
    return defaults[endpoint] || '{}';
  };

  const handleEndpointChange = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(getDefaultRequestBody(endpoint));
    setResponse(null);
    setError(null);
  };

  const handleExecute = async () => {
    if (!selectedEndpoint) {
      setError('Please select an endpoint');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e) {
        throw new Error('Invalid JSON in request body');
      }

      let result: any;

      switch (selectedEndpoint) {
        case 'createPage':
          result = await pagesApi.create(parsedBody.changes[0]?.value || parsedBody);
          break;
        case 'searchPage':
          result = await pagesApi.searchPage(parsedBody);
          break;
        case 'searchInPage':
          result = await pagesApi.searchInPage(parsedBody);
          break;
        case 'updatePage':
          result = await pagesApi.update(parsedBody.objectId || '1', parsedBody.changes[0]?.value || parsedBody);
          break;
        case 'syncPage':
          result = await pagesApi.syncPage(parsedBody.objectId || '1', parsedBody.changes[0]?.value || parsedBody);
          break;
        case 'connectPage':
          result = await pagesApi.connectPage(parsedBody.objectId || '1', parsedBody.changes[0]?.value || parsedBody);
          break;
        case 'disconnectPage':
          result = await pagesApi.disconnectPage(parsedBody.objectId || '1', parsedBody.changes[0]?.value || parsedBody);
          break;
        case 'searchMessage':
          result = await pagesApi.searchMessage(parsedBody);
          break;
        case 'disconnect':
          result = await pagesApi.disconnect(parsedBody.objectId || '1', parsedBody.changes[0]?.value || parsedBody);
          break;
        case 'operatePage':
          const operateData = parsedBody.changes[0]?.value || parsedBody;
          result = await pagesApi.operate(
            operateData.pageId || parsedBody.objectId || '1',
            operateData.operation || 'addMember',
            operateData.targetUserId || '2',
            operateData.targetRole || 'Member',
            operateData.actorUserId || '1'
          );
          break;
        case 'findUsersToPage':
          result = await pagesApi.findUsersToPage(parsedBody);
          break;
        case 'doBulk':
          result = await pagesApi.doBulk(parsedBody);
          break;
        default:
          throw new Error('Unknown endpoint');
      }

      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Failed to execute request');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <PageHeader title="Page Operations API" />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Left Column: Endpoint Selection and Request */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Select Endpoint:
            </label>
            <select
              className="select"
              value={selectedEndpoint}
              onChange={(e) => handleEndpointChange(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">-- Select an endpoint --</option>
              {endpoints.map((ep) => (
                <option key={ep.value} value={ep.value}>
                  {ep.label} - {ep.description}
                </option>
              ))}
            </select>
          </div>

          {selectedEndpoint && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Request Body (JSON):
                </label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '300px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleExecute}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Executing...' : 'Execute Request'}
              </button>
            </>
          )}
        </div>

        {/* Right Column: Response */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Response (JSON):
          </label>
          
          {error && (
            <div style={{
              padding: '12px',
              background: '#fee',
              color: '#c00',
              borderRadius: '6px',
              marginBottom: '12px',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              Error: {error}
            </div>
          )}

          {response && (
            <pre style={{
              padding: '12px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '6px',
              overflow: 'auto',
              maxHeight: '600px',
              fontSize: '12px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          )}

          {!response && !error && !loading && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999',
              border: '2px dashed #ddd',
              borderRadius: '6px'
            }}>
              Select an endpoint and click "Execute Request" to see the JSON response here
            </div>
          )}

          {loading && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
