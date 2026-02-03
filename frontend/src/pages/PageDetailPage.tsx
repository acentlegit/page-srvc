import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { pagesApi, PageModel, MessageModel } from '../api/apiClient'

type Message = {
  id: string
  author: string
  text: string
  time: string
}

export default function PageDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state ?? {}) as { pageId?: string; pageName?: string }
  const [pageId, setPageId] = useState<string | null>(locationState.pageId ?? null)
  const [pageName, setPageName] = useState(locationState.pageName ?? 'Untitled Page')
  const [page, setPage] = useState<PageModel | null>(null)
  const [members, setMembers] = useState<string[]>([])
  const [memberInput, setMemberInput] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch page data from REST API
  useEffect(() => {
    const pageIdToLoad = locationState.pageId || pageId
    if (!pageIdToLoad) return

    const fetchPage = async () => {
      try {
        setLoading(true)
        const fetchedPage = await pagesApi.get(pageIdToLoad)
        setPage(fetchedPage)
        setPageId(fetchedPage.id)
        setPageName(fetchedPage.name)
        setMembers(fetchedPage.members.map(m => m.userId))
      } catch (err: any) {
        console.error('Failed to fetch page:', err)
        window.alert('Failed to load page: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [locationState.pageId, pageId])

  // Fetch messages from REST API
  useEffect(() => {
    if (!pageId) return

    const fetchMessages = async () => {
      try {
        const apiMessages = await pagesApi.getMessages(pageId)
        const mappedMessages: Message[] = apiMessages.map((msg: MessageModel) => ({
          id: msg.messageId,
          author: msg.userId,
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString(),
        }))
        setMessages(mappedMessages)
      } catch (err: any) {
        console.error('Failed to fetch messages:', err)
      }
    }

    fetchMessages()
  }, [pageId])

  const canAddMember = memberInput.trim().length > 0

  const addMember = async () => {
    const trimmed = memberInput.trim()
    if (!trimmed || !pageId || members.includes(trimmed)) return
    try {
      await pagesApi.operate(pageId, 'AddMember', trimmed, 'Member', 'admin')
      // Refresh page data
      const updatedPage = await pagesApi.get(pageId)
      setPage(updatedPage)
      setMembers(updatedPage.members.map(m => m.userId))
      setMemberInput('')
    } catch (err: any) {
      console.error('Failed to add member:', err)
      window.alert('Failed to add member: ' + (err.message || 'Unknown error'))
    }
  }

  const removeMember = async (email: string) => {
    if (!pageId) return
    try {
      await pagesApi.operate(pageId, 'RemoveMember', email, 'Member', 'admin')
      // Refresh page data
      const updatedPage = await pagesApi.get(pageId)
      setPage(updatedPage)
      setMembers(updatedPage.members.map(m => m.userId))
    } catch (err: any) {
      console.error('Failed to remove member:', err)
      window.alert('Failed to remove member: ' + (err.message || 'Unknown error'))
    }
  }

  const sendMessage = async () => {
    const trimmed = messageInput.trim()
    if (!trimmed || !pageId) return
    const userId = 'admin' // TODO: Get from auth context
    try {
      const createdMessage = await pagesApi.createMessage(pageId, userId, trimmed)
      const newMessage: Message = {
        id: createdMessage.messageId,
        author: createdMessage.userId,
        text: createdMessage.text,
        time: new Date(createdMessage.createdAt).toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, newMessage])
      setMessageInput('')
    } catch (err: any) {
      console.error('Failed to send message:', err)
      window.alert('Failed to send message: ' + (err.message || 'Unknown error'))
    }
  }

  const memberCount = useMemo(() => `${members.length} members`, [members.length])
  const displayTitle = pageName || 'Page'

  const renamePage = async () => {
    const nextName = window.prompt('Rename page', displayTitle)?.trim()
    if (!nextName || !pageId) return
    try {
      await pagesApi.update(pageId, { name: nextName })
      setPageName(nextName)
      if (page) {
        setPage({ ...page, name: nextName })
      }
    } catch (err: any) {
      console.error('Failed to rename page:', err)
      window.alert('Failed to rename page: ' + (err.message || 'Unknown error'))
    }
  }

  const archivePage = async () => {
    const confirmed = window.confirm('Archive this page?')
    if (!confirmed || !pageId) return
    try {
      // Note: Archive operation might need to be implemented in backend
      // For now, we'll just navigate away
      navigate('/communication/pages')
    } catch (err: any) {
      console.error('Failed to archive page:', err)
      window.alert('Failed to archive page: ' + (err.message || 'Unknown error'))
    }
  }

  const leavePage = async () => {
    const currentUser = 'you@beam.com' // TODO: Get from auth context
    if (!members.includes(currentUser)) {
      window.alert('You are not a member of this page.')
      return
    }
    const confirmed = window.confirm('Leave this page?')
    if (!confirmed || !pageId) return
    try {
      await pagesApi.operate(pageId, 'RemoveMember', currentUser, 'Member', 'admin')
      navigate('/communication/pages')
    } catch (err: any) {
      console.error('Failed to leave page:', err)
      window.alert('Failed to leave page: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="card">
      <PageHeader title={displayTitle} right={<span style={{ color: '#777' }}>{memberCount}</span>} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          <div style={{ marginBottom: 12, fontWeight: 700 }}>Messages</div>
          <div
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: 8,
              padding: 12,
              minHeight: 260,
              background: '#fafafa',
              marginBottom: 12,
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {msg.author} • {msg.time}
                </div>
                <div style={{ fontSize: 14 }}>{msg.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message"
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
              }}
            />
            <button className="btn" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Members</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              className="input"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              placeholder="Add user email"
            />
            <button className="btn btn-secondary" disabled={!canAddMember} onClick={addMember}>
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {members.map((email) => (
              <div
                key={email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  border: '1px solid #e6e6e6',
                  borderRadius: 6,
                  background: '#fff',
                }}
              >
                <span style={{ fontSize: 13 }}>{email}</span>
                <button
                  onClick={() => removeMember(email)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, marginBottom: 10 }}>Page Operations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-secondary" onClick={renamePage}>
              Rename Page
            </button>
            <button className="btn btn-secondary" onClick={archivePage}>
              Archive Page
            </button>
            <button className="btn" onClick={leavePage}>
              Leave Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
