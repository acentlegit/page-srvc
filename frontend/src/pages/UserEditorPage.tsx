import React, { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import AdminTable from '../components/AdminTable'
import { usersApi } from '../api/apiClient'

type ImportRow = {
  status: string
  name: string
  description: string
  createdAt: string
  id?: string // Internal ID for tracking
  fileData?: any // Store file data for reference
}

export default function UserEditorPage() {
  const [selectedRole, setSelectedRole] = useState('Select Role')
  const [userType, setUserType] = useState('Select Users Type')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [loading, setLoading] = useState(false)

  const columns = [
    { key: 'status', label: 'Status' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'createdAt' },
  ] as const

  // Load imported files from localStorage on mount
  useEffect(() => {
    try {
      const storedImports = JSON.parse(localStorage.getItem('importedUserFiles') || '[]') as ImportRow[]
      setRows(storedImports)
    } catch (e) {
      console.warn('Failed to load imported files:', e)
    }
  }, [])

  // Save imported files to localStorage
  const saveToLocalStorage = (importRows: ImportRow[]) => {
    try {
      localStorage.setItem('importedUserFiles', JSON.stringify(importRows))
    } catch (e) {
      console.warn('Failed to save imported files:', e)
    }
  }

  const downloadTemplate = () => {
    if (selectedRole === 'Select Role') {
      window.alert('Please select a role first')
      return
    }

    // Generate CSV template based on selected role
    const csvContent = `email,firstName,lastName,phone,role,status
user1@example.com,John,Doe,1234567890,${selectedRole},active
user2@example.com,Jane,Smith,0987654321,${selectedRole},active
user3@example.com,Bob,Johnson,5555555555,${selectedRole},active`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedRole}-user-template.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const parseCSV = (content: string): Array<{ email: string; firstName: string; lastName: string; phone: string; role: string }> => {
    const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    if (!lines.length) return []

    // Check if first line is header
    const hasHeader = lines[0].toLowerCase().includes('email')
    const dataLines = hasHeader ? lines.slice(1) : lines

    return dataLines
      .map(line => {
        const cells = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        return {
          email: cells[0] || '',
          firstName: cells[1] || '',
          lastName: cells[2] || '',
          phone: cells[3] || 'N/A',
          role: cells[4] || selectedRole !== 'Select Role' ? selectedRole : 'member',
        }
      })
      .filter(row => row.email && row.email.includes('@'))
  }

  const handleFileUpload = async (file: File | null) => {
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      window.alert('Please upload a CSV file')
      return
    }

    setLoading(true)
    const fileName = file.name
    const fileId = `import-${Date.now()}-${Math.random().toString(36).substring(7)}`

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          const parsedUsers = parseCSV(content)

          if (parsedUsers.length === 0) {
            window.alert('No valid users found in CSV file. Please check the format.')
            setLoading(false)
            return
          }

          // Track results
          let registeredCount = 0
          let modifiedCount = 0
          let conflictCount = 0
          const errors: string[] = []

          // Create/update users
          for (const userData of parsedUsers) {
            try {
              // Check if user already exists
              const existingUsers = await usersApi.search(userData.email)
              const existingUser = existingUsers.find(u => u.email?.toLowerCase() === userData.email.toLowerCase())

              if (existingUser) {
                // User exists - try to update
                try {
                  await usersApi.update(existingUser.id, {
                    firstName: userData.firstName || existingUser.firstName,
                    lastName: userData.lastName || existingUser.lastName,
                    phone: userData.phone || existingUser.phone,
                    role: userData.role || existingUser.role,
                  })
                  modifiedCount++
                } catch (updateErr) {
                  conflictCount++
                  errors.push(`Failed to update ${userData.email}: ${(updateErr as Error).message}`)
                }
              } else {
                // New user - create
                try {
                  await usersApi.create({
                    email: userData.email,
                    firstName: userData.firstName || userData.email.split('@')[0],
                    lastName: userData.lastName || '',
                    phone: userData.phone || 'N/A',
                    role: userData.role,
                    blocked: 'OFF',
                    beamId: userData.email.split('@')[0],
                    customId: `custom-${Date.now()}`,
                    status: 'active',
                  })
                  registeredCount++
                } catch (createErr) {
                  conflictCount++
                  errors.push(`Failed to create ${userData.email}: ${(createErr as Error).message}`)
                }
              }
            } catch (err) {
              conflictCount++
              errors.push(`Error processing ${userData.email}: ${(err as Error).message}`)
            }
          }

          // Determine overall status
          let status = '🟢 register'
          let description = ''
          if (conflictCount > 0 && registeredCount === 0 && modifiedCount === 0) {
            status = '🔴 conflict'
            description = `${conflictCount} conflicts`
          } else if (modifiedCount > 0 && registeredCount === 0) {
            status = '🟠 modify'
            description = `${modifiedCount} modified`
          } else if (registeredCount > 0) {
            status = '🟢 register'
            description = `${registeredCount} registered`
            if (modifiedCount > 0) description += `, ${modifiedCount} modified`
            if (conflictCount > 0) description += `, ${conflictCount} conflicts`
          }

          // Create import record
          const importRow: ImportRow = {
            status,
            name: fileName,
            description,
            createdAt: new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            id: fileId,
            fileData: {
              fileName,
              totalUsers: parsedUsers.length,
              registered: registeredCount,
              modified: modifiedCount,
              conflicts: conflictCount,
              errors,
            },
          }

          // Add to rows and save
          const updatedRows = [importRow, ...rows]
          setRows(updatedRows)
          saveToLocalStorage(updatedRows)

          // Show summary
          const summary = `Import Complete!\n\n` +
            `✅ Registered: ${registeredCount}\n` +
            `🔄 Modified: ${modifiedCount}\n` +
            `❌ Conflicts: ${conflictCount}\n` +
            `Total: ${parsedUsers.length}`
          
          window.alert(summary)
          
          if (errors.length > 0) {
            console.error('Import errors:', errors)
          }
        } catch (err: any) {
          console.error('Failed to process CSV:', err)
          window.alert(`Failed to process CSV file: ${err.message || 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }

      reader.onerror = () => {
        window.alert('Failed to read file')
        setLoading(false)
      }

      reader.readAsText(file)
    } catch (err: any) {
      console.error('Failed to upload file:', err)
      window.alert(`Failed to upload file: ${err.message || 'Unknown error'}`)
      setLoading(false)
    }
  }

  const handleView = (row: ImportRow) => {
    if (row.fileData) {
      const details = `Import Details:\n\n` +
        `File: ${row.name}\n` +
        `Status: ${row.status}\n` +
        `Date: ${row.createdAt}\n` +
        `Total Users: ${row.fileData.totalUsers}\n` +
        `Registered: ${row.fileData.registered}\n` +
        `Modified: ${row.fileData.modified}\n` +
        `Conflicts: ${row.fileData.conflicts}\n` +
        `${row.description ? `\nDescription: ${row.description}` : ''}`
      window.alert(details)
    } else {
      window.alert(`File: ${row.name}\nStatus: ${row.status}\nDate: ${row.createdAt}`)
    }
  }

  const handleEdit = (row: ImportRow) => {
    const newDescription = window.prompt('Update description:', row.description)?.trim()
    if (newDescription !== null && newDescription !== row.description) {
      const updatedRows = rows.map(r => 
        r.id === row.id ? { ...r, description: newDescription || '' } : r
      )
      setRows(updatedRows)
      saveToLocalStorage(updatedRows)
    }
  }

  const handleDelete = (row: ImportRow) => {
    if (window.confirm(`Delete import record for "${row.name}"?`)) {
      const updatedRows = rows.filter(r => r.id !== row.id)
      setRows(updatedRows)
      saveToLocalStorage(updatedRows)
    }
  }

  return (
    <div className="card">
      <PageHeader title="Import People List" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div className="small-label">Select Role to download CSV file template</div>
          <select 
            className="select" 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option>Select Role</option>
            <option>admin</option>
            <option>manager</option>
            <option>dispatcher</option>
            <option>member</option>
            <option>customer</option>
            <option>staff</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button 
            className="btn" 
            onClick={downloadTemplate}
            style={{ background: selectedRole === 'Select Role' ? '#ccc' : '#007bff', color: '#fff' }}
            disabled={selectedRole === 'Select Role'}
          >
            Download Template
          </button>
        </div>

        <div>
          <div className="small-label">Select Users Type</div>
          <select 
            className="select" 
            value={userType} 
            onChange={(e) => setUserType(e.target.value)}
          >
            <option>Select Users Type</option>
            <option>internal</option>
            <option>external</option>
          </select>
        </div>

        <div>
          <div className="small-label">Upload CSV to create multiple users</div>
          <input 
            type="file" 
            className="input" 
            accept=".csv"
            onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
            disabled={loading}
          />
          {loading && (
            <div style={{ fontSize: 12, color: '#007bff', marginTop: 4 }}>
              Processing CSV file...
            </div>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <div style={{ marginBottom: 8, color: '#777', fontSize: 14 }}>
          {rows.length} imported file(s)
        </div>
      )}

      <AdminTable<ImportRow> 
        columns={columns as any} 
        rows={rows}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}