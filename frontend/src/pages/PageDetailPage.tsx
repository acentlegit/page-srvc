import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { pagesApi, PageModel, MessageModel } from '../api/apiClient'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Message = {
  id: string
  author: string
  text: string
  time: string
  media?: {
    type: 'image' | 'audio' | 'video'
    url: string
    filename?: string
  }
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [pageMedia, setPageMedia] = useState<Array<{ type: 'image' | 'audio' | 'video', url: string, filename: string }>>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showJoinInterface, setShowJoinInterface] = useState(false)
  const [videoCallActive, setVideoCallActive] = useState(false)
  const [joinName, setJoinName] = useState('')
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [showMicDropdown, setShowMicDropdown] = useState(false)
  const [showCameraDropdown, setShowCameraDropdown] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [memberLocations, setMemberLocations] = useState<Map<string, { position: [number, number], timestamp: number, name: string }>>(new Map())
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null)
  const [mapSearchQuery, setMapSearchQuery] = useState('')
  const [showMapSettings, setShowMapSettings] = useState(false)
  const [showMapFilter, setShowMapFilter] = useState(false)
  const [mapToolMode, setMapToolMode] = useState<'hand' | 'marker' | null>(null)
  const [mapMarkers, setMapMarkers] = useState<Array<{ id: string, position: [number, number], label?: string }>>([])
  const [mapMinimized, setMapMinimized] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const watchIdRef = useRef<number | null>(null)

  // Fetch page data from REST API
  useEffect(() => {
    const pageIdToLoad = locationState.pageId || pageId
    if (!pageIdToLoad) return

    const fetchPage = async () => {
      try {
        setLoading(true)
        // Set timeout for API call
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 8000)
        )
        
        const fetchedPage = await Promise.race([
          pagesApi.get(pageIdToLoad),
          timeoutPromise
        ]) as PageModel
        
        setPage(fetchedPage)
        setPageId(fetchedPage.id)
        setPageName(fetchedPage.name || 'Untitled Page')
        setMembers(fetchedPage.members.map(m => m.userId))
      } catch (err: any) {
        console.warn('API unavailable, using localStorage fallback:', err.message)
        
        // Fallback to localStorage
        try {
          const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[]
          const foundPage = storedPages.find(p => p.id === pageIdToLoad)
          
          if (foundPage) {
            setPage(foundPage)
            setPageId(foundPage.id)
            setPageName(foundPage.name || 'Untitled Page')
            setMembers(foundPage.members.map(m => m.userId))
          } else {
            // Create a basic page structure if not found
            const basicPage: PageModel = {
              id: pageIdToLoad,
              type: 'LiveGroup',
              name: locationState.pageName || pageName || 'Untitled Page',
              members: [],
              connections: {},
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
            setPage(basicPage)
            setPageId(basicPage.id)
            setPageName(basicPage.name)
            setMembers([])
          }
        } catch (localErr) {
          console.error('Failed to load from localStorage:', localErr)
          // Still set basic page info so UI works
          setPageId(pageIdToLoad)
          setPageName(pageName || 'Untitled Page')
          setMembers([])
        }
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
        // Set timeout for API call
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 8000)
        )
        
        const apiMessages = await Promise.race([
          pagesApi.getMessages(pageId),
          timeoutPromise
        ]) as MessageModel[]
        
        const mappedMessages: Message[] = apiMessages.map((msg: MessageModel) => ({
          id: msg.messageId,
          author: msg.userId,
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString(),
          media: (msg as any).media || undefined,
        }))
        setMessages(mappedMessages)
      } catch (err: any) {
        console.warn('API unavailable for messages, using localStorage fallback:', err.message)
        
        // Fallback to localStorage
        try {
          const storedMessages = JSON.parse(localStorage.getItem(`pageMessages_${pageId}`) || '[]')
          if (storedMessages.length > 0) {
            setMessages(storedMessages)
          }
        } catch (localErr) {
          console.error('Failed to load messages from localStorage:', localErr)
          // Keep empty messages array
          setMessages([])
        }
      }
    }

    fetchMessages()
  }, [pageId])

  // Load page media from localStorage
  useEffect(() => {
    if (!pageId) return
    try {
      const storedMedia = localStorage.getItem(`pageMedia_${pageId}`)
      if (storedMedia) {
        setPageMedia(JSON.parse(storedMedia))
      }
    } catch (err) {
      console.error('Failed to load page media:', err)
    }
  }, [pageId])


  // Handle file selection by type
  const handleFileSelect = (type: 'image' | 'audio' | 'video') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    if (type === 'image') {
      input.accept = 'image/*'
    } else if (type === 'audio') {
      input.accept = 'audio/*'
    } else {
      input.accept = 'video/*'
    }
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files || []) as File[]
      if (files.length > 0) {
        setSelectedFiles((prev) => [...prev, ...files])
        setShowUploadModal(false)
        // Show feedback
        console.log(`Selected ${files.length} ${type} file(s)`)
      }
    }
    input.oncancel = () => {
      // User cancelled file selection
      console.log('File selection cancelled')
    }
    input.click()
  }


  // Convert file to base64/data URL for preview
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Upload media files
  const uploadMedia = async (files: File[]) => {
    if (!pageId || files.length === 0) return []

    const uploadedMedia: Array<{ type: 'image' | 'audio' | 'video', url: string, filename: string }> = []

    for (const file of files) {
      try {
        const dataUrl = await fileToDataUrl(file)
        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('audio/') ? 'audio' : 
                        file.type.startsWith('video/') ? 'video' : 'image'
        
        const mediaItem = {
          type: fileType as 'image' | 'audio' | 'video',
          url: dataUrl,
          filename: file.name
        }
        
        uploadedMedia.push(mediaItem)
      } catch (err) {
        console.error('Failed to process file:', file.name, err)
      }
    }

    // Store in localStorage (in real app, upload to server)
    const updatedMedia = [...pageMedia, ...uploadedMedia]
    setPageMedia(updatedMedia)
    localStorage.setItem(`pageMedia_${pageId}`, JSON.stringify(updatedMedia))

    return uploadedMedia
  }

  const canAddMember = memberInput.trim().length > 0

  // Helper function to add a member with a specific email
  const addMemberWithEmail = async (email: string) => {
    if (!email || !pageId) {
      window.alert('Please enter a user email')
      return
    }
    if (members.includes(email)) {
      window.alert('User is already a member of this page')
      return
    }
    
    try {
      // Use connectPage API which has better error handling
      await pagesApi.connectPage(pageId, {
        userId: email,
        role: 'Member'
      })
      
      // Update local state immediately
      setMembers((prev) => [...prev, email])
      
      // Try to refresh page data from API (but don't fail if it doesn't work)
      try {
        const updatedPage = await pagesApi.get(pageId)
        setPage(updatedPage)
        setMembers(updatedPage.members.map(m => m.userId))
      } catch (refreshErr) {
        // If refresh fails, that's okay - we already updated local state
        console.log('Could not refresh page data, but member was added locally')
      }
    } catch (err: any) {
      console.error('Failed to add member:', err)
      
      // If API fails, try to add to localStorage as fallback
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[]
        const pageIndex = storedPages.findIndex(p => p.id === pageId)
        if (pageIndex >= 0) {
          const page = storedPages[pageIndex]
          if (!page.members.some((m: any) => (m.userId || m) === email)) {
            page.members = [...(page.members || []), { userId: email, role: 'Member' }]
            localStorage.setItem('localPages', JSON.stringify(storedPages))
            setMembers((prev) => [...prev, email])
            // Don't show alert for localStorage fallback - it's expected behavior
            return
          }
        } else {
          // Page not in localStorage, create it
          const newPage: PageModel = {
            id: pageId,
            type: 'LiveGroup',
            name: pageName || 'Untitled Page',
            members: [{ userId: email, role: 'Member' }],
            connections: {},
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
          storedPages.push(newPage)
          localStorage.setItem('localPages', JSON.stringify(storedPages))
          setMembers([email])
          return
        }
      } catch (localErr) {
        console.error('Failed to save to localStorage:', localErr)
      }
      
      // Only show error if both API and localStorage failed
      window.alert('Failed to add member: ' + (err.message || 'Unknown error'))
    }
  }

  const addMember = async () => {
    const trimmed = memberInput.trim()
    if (!trimmed) {
      window.alert('Please enter a user email')
      return
    }
    
    await addMemberWithEmail(trimmed)
    setMemberInput('') // Clear input after adding
  }

  const removeMember = async (email: string) => {
    if (!pageId) return
    
    try {
      // Use disconnectPage API which has better error handling
      await pagesApi.disconnectPage(pageId, {
        userId: email
      })
      
      // Update local state immediately
      setMembers((prev) => prev.filter(m => m !== email))
      
      // Try to refresh page data from API (but don't fail if it doesn't work)
      try {
        const updatedPage = await pagesApi.get(pageId)
        setPage(updatedPage)
        setMembers(updatedPage.members.map(m => m.userId))
      } catch (refreshErr) {
        // If refresh fails, that's okay - we already updated local state
        console.log('Could not refresh page data, but member was removed locally')
      }
    } catch (err: any) {
      console.error('Failed to remove member:', err)
      
      // If API fails, try to remove from localStorage as fallback
      try {
        const storedPages = JSON.parse(localStorage.getItem('localPages') || '[]') as PageModel[]
        const pageIndex = storedPages.findIndex(p => p.id === pageId)
        if (pageIndex >= 0) {
          const page = storedPages[pageIndex]
          page.members = page.members.filter((m: any) => (m.userId || m) !== email)
          localStorage.setItem('localPages', JSON.stringify(storedPages))
          setMembers((prev) => prev.filter(m => m !== email))
          window.alert('Member removed successfully (saved locally)')
          return
        }
      } catch (localErr) {
        console.error('Failed to update localStorage:', localErr)
      }
      
      window.alert('Failed to remove member: ' + (err.message || 'Unknown error'))
    }
  }

  const sendMessage = async () => {
    const trimmed = messageInput.trim()
    const hasFiles = selectedFiles.length > 0
    
    if (!trimmed && !hasFiles || !pageId) return
    
    const userId = localStorage.getItem('currentUserId') || 'admin'
    
    try {
      // Upload media files if any
      let uploadedMedia: Array<{ type: 'image' | 'audio' | 'video', url: string, filename: string }> = []
      if (hasFiles) {
        uploadedMedia = await uploadMedia(selectedFiles)
        setSelectedFiles([])
      }

      // Create message with media
      const messageText = trimmed || (hasFiles ? `Shared ${uploadedMedia.length} file(s)` : '')
      
      // Try API first
      try {
        const createdMessage = await pagesApi.createMessage(pageId, userId, messageText)
        
        const newMessage: Message = {
          id: createdMessage.messageId,
          author: createdMessage.userId,
          text: messageText,
          time: new Date(createdMessage.createdAt).toLocaleTimeString(),
          media: uploadedMedia.length > 0 ? uploadedMedia[0] : undefined,
        }
        
        setMessages((prev) => [...prev, newMessage])
        
        // Save to localStorage as backup
        try {
          const storedMessages = JSON.parse(localStorage.getItem(`pageMessages_${pageId}`) || '[]')
          storedMessages.push(newMessage)
          localStorage.setItem(`pageMessages_${pageId}`, JSON.stringify(storedMessages))
        } catch (e) {
          // Ignore localStorage errors
        }
      } catch (apiErr: any) {
        // If API fails, save to localStorage
        console.warn('API unavailable, saving message locally:', apiErr.message)
        
        const newMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          author: userId,
          text: messageText,
          time: new Date().toLocaleTimeString(),
          media: uploadedMedia.length > 0 ? uploadedMedia[0] : undefined,
        }
        
        setMessages((prev) => [...prev, newMessage])
        
        // Save to localStorage
        try {
          const storedMessages = JSON.parse(localStorage.getItem(`pageMessages_${pageId}`) || '[]')
          storedMessages.push(newMessage)
          localStorage.setItem(`pageMessages_${pageId}`, JSON.stringify(storedMessages))
        } catch (e) {
          console.error('Failed to save message to localStorage:', e)
        }
      }
      
      setMessageInput('')
    } catch (err: any) {
      console.error('Failed to send message:', err)
      window.alert('Failed to send message: ' + (err.message || 'Unknown error'))
    }
  }

  const memberCount = useMemo(() => `${members.length} members`, [members.length])
  const displayTitle = useMemo(() => {
    // Use page name from state, or from page object, or fallback
    return page?.name || pageName || 'Untitled Page'
  }, [page?.name, pageName])

  // Get current user ID (from localStorage or default)
  const currentUserId = useMemo(() => {
    return localStorage.getItem('currentUserId') || 'admin'
  }, [])


  // Get organization cudb (from localStorage, environment, or page connections)
  const organizationCudb = useMemo(() => {
    // Try to get from localStorage first
    const storedCudb = localStorage.getItem('organizationCudb')
    if (storedCudb) return storedCudb
    
    // Try to get from page connections
    if (page?.connections?.cudb) return page.connections.cudb
    
    // Try to extract from API base URL (e.g., cudb-root-api.staging.beamdev.hu -> cudb-root)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const cudbMatch = apiBaseUrl.match(/^https?:\/\/([^.-]+)/)
    if (cudbMatch) return cudbMatch[1]
    
    // Default fallback
    return 'cudb-root'
  }, [page])

  // Build video conferencing URL
  const videoConferenceUrl = useMemo(() => {
    if (!pageId || !currentUserId || !organizationCudb) return null
    
    // URL encode the parameters
    const encodedPageId = encodeURIComponent(pageId)
    const encodedUserId = encodeURIComponent(currentUserId)
    const encodedCudb = encodeURIComponent(organizationCudb)
    const encodedMetadata = encodeURIComponent(currentUserId)
    
    // Try to hide branding with URL parameters
    return `https://page.beam.live/?pageId=${encodedPageId}&u=${encodedUserId}&o=${encodedCudb}&metadata=${encodedMetadata}&hideLogo=true&branding=false&showLogo=false`
  }, [pageId, currentUserId, organizationCudb])

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
    const currentUser = localStorage.getItem('currentUserId') || 'admin'
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

  // Request location permission explicitly with user-friendly prompt
  const requestLocationPermission = async (showPrompt: boolean = true): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      if (showPrompt) {
        window.alert('Geolocation is not supported by your browser.')
      }
      return false
    }

    // Check if permission is already granted
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        setLocationPermissionGranted(permission.state === 'granted')
        
        if (permission.state === 'granted') {
          return true
        } else if (permission.state === 'prompt') {
          // Will prompt on getCurrentPosition call
          if (showPrompt) {
            // Show friendly message before browser prompt
            const userConfirmed = window.confirm(
              '📍 Location Access Request\n\n' +
              'To show your location on the map and share it with page members, we need your location permission.\n\n' +
              'Click "Allow" when your browser asks for location access.\n\n' +
              'Click OK to continue...'
            )
            return userConfirmed
          }
          return true
        } else {
          // Permission denied
          if (showPrompt) {
            const shouldRequest = window.confirm(
              '📍 Location Permission Denied\n\n' +
              'Location access was previously denied. To enable it:\n\n' +
              '1. Click the lock/info icon in your browser\'s address bar\n' +
              '2. Allow location access\n' +
              '3. Refresh this page\n\n' +
              'Click OK to try requesting permission again now.'
            )
            return shouldRequest
          }
          return false
        }
      } catch (err) {
        // Permissions API not supported, will prompt on getCurrentPosition
        console.log('Permissions API not available, will prompt on location request')
        if (showPrompt) {
          const userConfirmed = window.confirm(
            '📍 Location Access Request\n\n' +
            'To show your location on the map, we need your location permission.\n\n' +
            'Click "Allow" when your browser asks for location access.\n\n' +
            'Click OK to continue...'
          )
          return userConfirmed
        }
        return true
      }
    }
    
    if (showPrompt) {
      const userConfirmed = window.confirm(
        '📍 Location Access Request\n\n' +
        'To show your location on the map, we need your location permission.\n\n' +
        'Click "Allow" when your browser asks for location access.\n\n' +
        'Click OK to continue...'
      )
      return userConfirmed
    }
    
    return true
  }

  // Save user location to localStorage and share with page members
  const saveUserLocation = (latitude: number, longitude: number) => {
    if (!pageId) return
    
    const currentUserId = localStorage.getItem('currentUserId') || 'admin'
    const locationData = {
      position: [latitude, longitude] as [number, number],
      timestamp: Date.now(),
      name: currentUserId
    }
    
    // Update local state
    setMemberLocations(prev => {
      const newMap = new Map(prev)
      newMap.set(currentUserId, locationData)
      return newMap
    })
    
    // Save to localStorage for this page
    try {
      const pageLocationsKey = `pageLocations_${pageId}`
      const existingLocations = JSON.parse(localStorage.getItem(pageLocationsKey) || '{}')
      existingLocations[currentUserId] = locationData
      localStorage.setItem(pageLocationsKey, JSON.stringify(existingLocations))
    } catch (err) {
      console.error('Failed to save location:', err)
    }
  }

  // Load all members' locations from localStorage
  const loadMemberLocations = () => {
    if (!pageId) return
    
    try {
      const pageLocationsKey = `pageLocations_${pageId}`
      const storedLocations = JSON.parse(localStorage.getItem(pageLocationsKey) || '{}')
      
      const locationsMap = new Map<string, { position: [number, number], timestamp: number, name: string }>()
      Object.entries(storedLocations).forEach(([userId, data]: [string, any]) => {
        // Only show locations that are less than 1 hour old
        const age = Date.now() - (data.timestamp || 0)
        if (age < 3600000) { // 1 hour
          locationsMap.set(userId, data)
        }
      })
      
      setMemberLocations(locationsMap)
    } catch (err) {
      console.error('Failed to load member locations:', err)
    }
  }

  // Get user location with improved error handling
  const getCurrentLocation = async (autoRequest: boolean = false) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      if (!autoRequest) {
        window.alert('Geolocation is not supported by your browser.')
      }
      return
    }

    // Request permission first if not auto-requesting
    if (!autoRequest) {
      const hasPermission = await requestLocationPermission()
      if (!hasPermission) {
        setLocationLoading(false)
        return
      }
    }

    setLocationLoading(true)
    setLocationError(null)

    const options = {
      enableHighAccuracy: true, // Use GPS if available
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0 // Don't use cached position
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        console.log('GPS Location obtained:', { latitude, longitude, accuracy: `${accuracy}m` })
        
        setUserLocation([latitude, longitude])
        setLocationLoading(false)
        setLocationError(null)
        setLocationPermissionGranted(true)

        // Save location for page members
        saveUserLocation(latitude, longitude)

        // Center map on user location with appropriate zoom
        if (mapRef.current) {
          const zoomLevel = accuracy < 100 ? 16 : accuracy < 500 ? 15 : 14
          // Use setTimeout to ensure map is ready
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], zoomLevel, {
                animate: true,
                duration: 1.0
              })
              mapRef.current.invalidateSize()
            }
          }, 200)
        } else {
          // If map not ready yet, wait a bit longer
          setTimeout(() => {
            if (mapRef.current) {
              const zoomLevel = accuracy < 100 ? 16 : accuracy < 500 ? 15 : 14
              mapRef.current.setView([latitude, longitude], zoomLevel, {
                animate: true,
                duration: 1.0
              })
              mapRef.current.invalidateSize()
            }
          }, 1000)
        }

        // Show success message
        const successMsg = `Location found!\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}\nAccuracy: ${accuracy.toFixed(0)}m`
        console.log(successMsg)
        
        // Optional: Show a brief success notification
        const notification = document.createElement('div')
        notification.textContent = '📍 Location found!'
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4caf50;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10000;
          font-weight: 600;
          animation: slideIn 0.3s ease;
        `
        document.body.appendChild(notification)
        setTimeout(() => {
          notification.style.opacity = '0'
          notification.style.transition = 'opacity 0.3s'
          setTimeout(() => notification.remove(), 300)
        }, 2000)
      },
      (error) => {
        setLocationLoading(false)
        let errorMessage = 'Unable to get your location. '
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied. Please enable location permissions in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please check your GPS/network connection.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.'
            break
          default:
            errorMessage += 'An unknown error occurred.'
            break
        }
        
        setLocationError(errorMessage)
        setLocationPermissionGranted(false)
        console.error('Geolocation error:', error)
        
        if (error.code === error.PERMISSION_DENIED) {
          // Show more helpful message for permission denial
          const shouldRetry = window.confirm(
            'Location permission was denied.\n\n' +
            'To enable location sharing:\n' +
            '1. Click the lock/info icon in your browser\'s address bar\n' +
            '2. Allow location access\n' +
            '3. Refresh this page\n\n' +
            'Click OK to try again now.'
          )
          if (shouldRetry) {
            setTimeout(() => getCurrentLocation(false), 500)
          }
        } else if (!autoRequest) {
          window.alert(errorMessage)
        }
      },
      options
    )
  }

  // Watch position for continuous updates (optional)
  const startWatchingLocation = () => {
    if (!navigator.geolocation || watchIdRef.current !== null) return

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000 // Use cached position if less than 5 seconds old
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], mapRef.current.getZoom(), {
            animate: true,
            duration: 0.5
          })
        }
      },
      (error) => {
        console.error('Watch position error:', error)
      },
      options
    )
  }

  // Stop watching position
  const stopWatchingLocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      stopWatchingLocation()
    }
  }, [])

  // Fix Leaflet default icon issue
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }, [])

  // Auto-request location when user joins/views a page
  useEffect(() => {
    if (!pageId) return
    
    const currentUserId = localStorage.getItem('currentUserId') || 'admin'
    const hasRequestedLocation = sessionStorage.getItem(`locationRequested_${pageId}_${currentUserId}`)
    
    // Only auto-request once per session per page
    if (hasRequestedLocation) return
    
    // Check if user is a member of this page
    const isMember = members.length === 0 || members.includes(currentUserId)
    
    if (isMember) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        // Load existing member locations first
        loadMemberLocations()
        
        // Check if user already has a location saved
        const pageLocationsKey = `pageLocations_${pageId}`
        try {
          const storedLocations = JSON.parse(localStorage.getItem(pageLocationsKey) || '{}')
          const userLocationData = storedLocations[currentUserId]
          
          // If user has a recent location (less than 5 minutes old), use it
          if (userLocationData && userLocationData.position) {
            const age = Date.now() - (userLocationData.timestamp || 0)
            if (age < 300000) { // 5 minutes
              setUserLocation(userLocationData.position)
              // Center map on user location
              if (mapRef.current) {
                setTimeout(() => {
                  mapRef.current?.setView(userLocationData.position, 13, { animate: true })
                }, 500)
              }
              return
            }
          }
        } catch (err) {
          console.error('Failed to load user location:', err)
        }
        
        // Request location permission and get current location
        requestLocationPermission(true).then((hasPermission) => {
          if (hasPermission) {
            // Mark as requested to avoid multiple prompts
            sessionStorage.setItem(`locationRequested_${pageId}_${currentUserId}`, 'true')
            // Get current location
            getCurrentLocation(true)
          }
        })
      }, 1500) // Wait 1.5 seconds for page to load
      
      return () => clearTimeout(timer)
    }
  }, [pageId, members.length, members.join(',')])

  // Map search functionality
  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim() || !mapRef.current) return
    
    try {
      // Using Nominatim OpenStreetMap geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)
        
        mapRef.current.setView([lat, lon], 15, { animate: true, duration: 1.0 })
        
        // Add a temporary marker for the search result
        const newMarker = {
          id: `search-${Date.now()}`,
          position: [lat, lon] as [number, number],
          label: mapSearchQuery
        }
        setMapMarkers(prev => [...prev, newMarker])
        
        // Remove the search marker after 5 seconds
        setTimeout(() => {
          setMapMarkers(prev => prev.filter(m => m.id !== newMarker.id))
        }, 5000)
      } else {
        window.alert('Location not found. Please try a different search term.')
      }
    } catch (err) {
      console.error('Search error:', err)
      window.alert('Search failed. Please try again.')
    }
  }

  // Add marker at clicked location
  const addMarkerAtLocation = (lat: number, lng: number) => {
    if (mapToolMode !== 'marker') return
    
    const newMarker = {
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: [lat, lng] as [number, number],
      label: `Marker ${mapMarkers.length + 1}`
    }
    setMapMarkers(prev => [...prev, newMarker])
    setMapToolMode(null) // Exit marker mode after adding
  }

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (mapToolMode === 'marker') {
          addMarkerAtLocation(e.latlng.lat, e.latlng.lng)
        }
      }
    })
    return null
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-filter-dropdown]') && showMapFilter) {
        setShowMapFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMapFilter])

  // Invalidate map size when minimized state changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize()
      }, 300)
    }
  }, [mapMinimized])

  return (
    <div className="card" style={{ padding: 0 }}>
      {/* Enhanced Header with Action Toolbar */}
      <div style={{
        background: '#fff',
        padding: '20px 24px',
        borderRadius: '12px 12px 0 0',
        borderBottom: '1px solid #e6e6e6',
        color: '#333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#333' }}>{displayTitle}</h1>
            <div style={{ marginTop: 4, fontSize: 14, color: '#666' }}>{memberCount}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Action Buttons Toolbar */}
            {videoConferenceUrl && pageId && !videoCallActive && (
              <button
                onClick={() => setVideoCallActive(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #e6e6e6',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e0e0e0'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: 18 }}>📹</span>
                <span>Join Video</span>
              </button>
            )}
            <button
              onClick={() => setShowMap(!showMap)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: showMap ? '#dc3545' : '#f5f5f5',
                color: showMap ? '#fff' : '#333',
                border: '1px solid #e6e6e6',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!showMap) {
                  e.currentTarget.style.background = '#e0e0e0'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseOut={(e) => {
                if (!showMap) {
                  e.currentTarget.style.background = '#f5f5f5'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              <span style={{ fontSize: 18 }}>🗺️</span>
              <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>

      {/* Video Conferencing iframe - Show when call is active */}
      {videoConferenceUrl && pageId && videoCallActive && (
        <div style={{ 
          marginBottom: 24, 
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e6e6e6',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 20px',
            background: '#f5f5f5',
            borderBottom: '1px solid #e6e6e6',
            color: '#333'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>📹</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#333' }}>Video Conference</div>
                <div style={{ fontSize: 12, color: '#666' }}>{joinName || currentUserId}</div>
              </div>
            </div>
            <button 
              onClick={() => setVideoCallActive(false)}
              style={{ 
                fontSize: 14, 
                padding: '10px 20px', 
                background: 'rgba(220, 53, 69, 0.9)', 
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 53, 69, 1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)'}
            >
              Leave Call
            </button>
          </div>
          <div
            style={{
              width: '100%',
              minHeight: '700px',
              height: '80vh',
              position: 'relative',
              background: '#000'
            }}
          >
            <iframe
              src={videoConferenceUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                background: '#000'
              }}
              title="Video Conference"
              allow="camera; microphone; fullscreen; autoplay; display-capture"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            />
          </div>
        </div>
      )}

      {/* Map Interface */}
      {showMap && (
        <>
        <div style={{ 
          marginBottom: 24, 
          border: '1px solid #e6e6e6', 
          borderRadius: 12, 
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Map Header */}
          <div style={{
            background: '#f5f5f5',
            color: '#333',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e6e6e6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📍</span>
              <span style={{ fontWeight: 600 }}>{displayTitle}'s map</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setMapMinimized(!mapMinimized)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '4px 8px'
                }}
                title={mapMinimized ? 'Maximize' : 'Minimize'}
              >
                {mapMinimized ? '⬍' : '⬌'}
              </button>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: '4px 8px'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e6e6e6' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Search location..."
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleMapSearch()
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #e6e6e6',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
              <button
                onClick={handleMapSearch}
                disabled={!mapSearchQuery.trim()}
                style={{
                  padding: '8px 16px',
                  background: mapSearchQuery.trim() ? '#007bff' : '#f5f5f5',
                  color: mapSearchQuery.trim() ? '#fff' : '#999',
                  border: '1px solid #e6e6e6',
                  borderRadius: 6,
                  cursor: mapSearchQuery.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  fontSize: 13
                }}
                title="Search"
              >
                🔍
              </button>
            </div>
          </div>

          {/* Control Buttons */}
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid #e6e6e6',
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => setShowMapSettings(!showMapSettings)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid #e6e6e6',
                background: showMapSettings ? '#007bff' : '#fff',
                color: showMapSettings ? '#fff' : '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
              title="Settings"
            >
              ⚙️
            </button>
            <div style={{ position: 'relative' }} data-filter-dropdown>
              <button
                onClick={() => setShowMapFilter(!showMapFilter)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1px solid #e6e6e6',
                  background: showMapFilter ? '#007bff' : '#fff',
                  color: showMapFilter ? '#fff' : '#333',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
                title="Filter"
              >
                🔽
              </button>
              {showMapFilter && (
                <div style={{
                  position: 'absolute',
                  top: 50,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #e6e6e6',
                  borderRadius: 8,
                  padding: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: 150
                }}>
                  <div style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e6e6e6', marginBottom: 4 }}>Filter Options</div>
                  <button
                    onClick={() => {
                      setMapMarkers([])
                      setShowMapFilter(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      borderRadius: 4
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    🗑️ Clear All Markers
                  </button>
                  <button
                    onClick={() => {
                      if (mapRef.current) {
                        // Reset to user location, first member location, or world view
                        if (userLocation) {
                          mapRef.current.setView(userLocation, 13)
                        } else if (memberLocations.size > 0) {
                          const firstMember = Array.from(memberLocations.values())[0]
                          mapRef.current.setView(firstMember.position, 10)
                        } else {
                          mapRef.current.setView([20, 0], 2) // World view
                        }
                      }
                      setShowMapFilter(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      borderRadius: 4
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    🏠 Reset View
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (!locationLoading) {
                  getCurrentLocation()
                }
              }}
              disabled={locationLoading}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: userLocation ? '2px solid #4caf50' : '1px solid #e6e6e6',
                background: locationLoading ? '#f5f5f5' : (userLocation ? '#e8f5e9' : '#fff'),
                cursor: locationLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: userLocation ? '0 2px 8px rgba(76, 175, 80, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                opacity: locationLoading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
              title={locationLoading ? 'Getting GPS location...' : userLocation ? `Location Active: ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : 'Click to get GPS location'}
            >
              {locationLoading ? '⏳' : (userLocation ? '✅' : '🎯')}
            </button>
            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize()
                }
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid #e6e6e6',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title="Refresh"
            >
              🔄
            </button>
          </div>

          {/* Map Container */}
          <div style={{ position: 'relative', height: mapMinimized ? '200px' : '500px', width: '100%', transition: 'height 0.3s ease' }}>
            <MapContainer
              center={(() => {
                // Priority: 1. User location, 2. First member location, 3. World center
                if (userLocation) return userLocation
                if (memberLocations.size > 0) {
                  const firstMember = Array.from(memberLocations.values())[0]
                  return firstMember.position
                }
                return [20, 0] // World center (equator, prime meridian) with zoom 2
              })()}
              zoom={(() => {
                if (userLocation) return 13
                if (memberLocations.size > 0) return 10
                return 2 // World view
              })()}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
              whenReady={() => {
                if (mapRef.current) {
                  setTimeout(() => mapRef.current?.invalidateSize(), 100)
                }
              }}
              ref={(map) => {
                if (map) {
                  mapRef.current = map
                }
              }}
            >
              <MapClickHandler />
              {mapView === 'map' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                  url="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVyNTFiazM2Y2xhbm1tN2g1eWMifQ.rJcFIG214AriISLbB6B5aw"
                />
              )}
              {/* Current user's location */}
              {userLocation && (
                <Marker 
                  position={userLocation}
                  title="Your Current Location (GPS)"
                >
                  <Popup>
                    <div>
                      <strong>Your Location</strong><br/>
                      {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              )}
              {/* All page members' locations */}
              {Array.from(memberLocations.entries()).map(([userId, locationData]) => {
                const currentUserId = localStorage.getItem('currentUserId') || 'admin'
                // Don't show duplicate marker for current user
                if (userId === currentUserId && userLocation) return null
                
                return (
                  <Marker 
                    key={`member-${userId}`}
                    position={locationData.position}
                    title={`${locationData.name}'s Location`}
                  >
                    <Popup>
                      <div>
                        <strong>{locationData.name}</strong><br/>
                        {locationData.position[0].toFixed(6)}, {locationData.position[1].toFixed(6)}<br/>
                        <small style={{ color: '#666' }}>
                          {new Date(locationData.timestamp).toLocaleTimeString()}
                        </small>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
              {/* Custom map markers */}
              {mapMarkers.map((marker) => (
                <Marker key={marker.id} position={marker.position}>
                  <Popup>{marker.label || 'Custom Marker'}</Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Bottom Controls */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              background: '#fff',
              borderRadius: 8,
              padding: '8px',
              display: 'flex',
              gap: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000
            }}>
              <button
                onClick={() => setMapView('map')}
                style={{
                  padding: '8px 16px',
                  background: mapView === 'map' ? '#007bff' : '#f5f5f5',
                  color: mapView === 'map' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                Map
              </button>
              <button
                onClick={() => setMapView('satellite')}
                style={{
                  padding: '8px 16px',
                  background: mapView === 'satellite' ? '#007bff' : '#f5f5f5',
                  color: mapView === 'satellite' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                Satellite
              </button>
              <div style={{ 
                display: 'flex', 
                gap: 4, 
                alignItems: 'center',
                paddingLeft: 8,
                borderLeft: '1px solid #e6e6e6',
                marginLeft: 4
              }}>
                <button
                  onClick={() => {
                    setMapToolMode(mapToolMode === 'hand' ? null : 'hand')
                    if (mapToolMode === 'marker') setMapToolMode('hand')
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid #e6e6e6',
                    background: mapToolMode === 'hand' ? '#007bff' : '#fff',
                    color: mapToolMode === 'hand' ? '#fff' : '#333',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    transition: 'all 0.2s'
                  }}
                  title="Hand Tool (Pan)"
                >
                  ✋
                </button>
                <button
                  onClick={() => {
                    setMapToolMode(mapToolMode === 'marker' ? null : 'marker')
                    if (mapToolMode === 'hand') setMapToolMode('marker')
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid #e6e6e6',
                    background: mapToolMode === 'marker' ? '#007bff' : '#fff',
                    color: mapToolMode === 'marker' ? '#fff' : '#333',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    transition: 'all 0.2s'
                  }}
                  title="Add Marker (Click on map)"
                >
                  📍
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      // Toggle dropdown - for now just show alert with options
                      const action = window.prompt('Map Options:\n1. Clear all markers\n2. Export markers\n3. Import markers\n\nEnter option (1-3) or cancel:')
                      if (action === '1') {
                        setMapMarkers([])
                      } else if (action === '2') {
                        const markersJson = JSON.stringify(mapMarkers, null, 2)
                        navigator.clipboard.writeText(markersJson)
                        window.alert('Markers copied to clipboard!')
                      } else if (action === '3') {
                        const markersJson = window.prompt('Paste markers JSON:')
                        if (markersJson) {
                          try {
                            const parsed = JSON.parse(markersJson)
                            setMapMarkers(parsed)
                          } catch (e) {
                            window.alert('Invalid JSON format')
                          }
                        }
                      }
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      border: '1px solid #e6e6e6',
                      background: '#fff',
                      borderRadius: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14
                    }}
                    title="More Options"
                  >
                    ▼
                  </button>
                </div>
                <div
                  onClick={() => getCurrentLocation(false)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: userLocation ? '#4caf50' : '#999',
                    cursor: 'pointer',
                    border: userLocation ? '2px solid #fff' : 'none',
                    boxShadow: userLocation ? '0 0 0 2px #4caf50' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                  title={userLocation ? `Location Active: ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : 'Click to get GPS location'}
                />
              </div>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={() => {
                const mapElement = document.querySelector('.leaflet-container')
                if (mapElement) {
                  if (!document.fullscreenElement) {
                    mapElement.requestFullscreen?.()
                  } else {
                    document.exitFullscreen?.()
                  }
                }
              }}
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                width: 40,
                height: 40,
                background: '#fff',
                border: '1px solid #e6e6e6',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000
              }}
              title="Fullscreen"
            >
              ⛶
            </button>
          </div>
        </div>

        {/* Map Settings Modal */}
        {showMapSettings && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}
            onClick={() => setShowMapSettings(false)}
          >
            <div 
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                minWidth: 300,
                maxWidth: 500,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700 }}>Map Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Map Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setMapView('map')
                        setShowMapSettings(false)
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: mapView === 'map' ? '#007bff' : '#f5f5f5',
                        color: mapView === 'map' ? '#fff' : '#333',
                        border: '1px solid #e6e6e6',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Map
                    </button>
                    <button
                      onClick={() => {
                        setMapView('satellite')
                        setShowMapSettings(false)
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: mapView === 'satellite' ? '#007bff' : '#f5f5f5',
                        color: mapView === 'satellite' ? '#fff' : '#333',
                        border: '1px solid #e6e6e6',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Satellite
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Map Height</label>
                  <button
                    onClick={() => {
                      setMapMinimized(!mapMinimized)
                      setTimeout(() => {
                        if (mapRef.current) mapRef.current.invalidateSize()
                      }, 300)
                      setShowMapSettings(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#f5f5f5',
                      border: '1px solid #e6e6e6',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {mapMinimized ? 'Maximize Map' : 'Minimize Map'}
                  </button>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Markers</label>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                    {mapMarkers.length} marker(s) on map
                  </div>
                  <button
                    onClick={() => {
                      setMapMarkers([])
                      setShowMapSettings(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Clear All Markers
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowMapSettings(false)}
                style={{
                  marginTop: 20,
                  width: '100%',
                  padding: '10px',
                  background: '#f5f5f5',
                  border: '1px solid #e6e6e6',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Messages Section */}
        <div style={{ 
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e6e6e6',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          {/* Messages Header */}
          <div style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '16px 20px',
            borderBottom: '1px solid #e6e6e6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>💬</span>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#333' }}>Messages</h2>
            </div>
          </div>
          
          {/* Messages Display Area */}
          <div
            style={{
              padding: '16px',
              minHeight: 450,
              maxHeight: 650,
              overflowY: 'auto',
              background: '#fafafa',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#999', 
                padding: 60,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12
              }}>
                <span style={{ fontSize: 48, opacity: 0.5 }}>💬</span>
                <div style={{ fontSize: 16, fontWeight: 500 }}>No messages yet</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Start the conversation!</div>
              </div>
            ) : (
              messages.map((msg) => {
                const isVideoCallMessage = msg.text?.includes('Video call')
                const isCurrentUser = msg.author === currentUserId
                return (
                <div 
                  key={msg.id} 
                  style={{ 
                    marginBottom: 16, 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ 
                    maxWidth: '75%',
                    padding: '12px 16px', 
                    background: isCurrentUser ? '#007bff' : (isVideoCallMessage ? '#e3f2fd' : '#fff'), 
                    borderRadius: isCurrentUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    border: isCurrentUser ? 'none' : '1px solid #e6e6e6',
                    boxShadow: isCurrentUser ? '0 2px 8px rgba(0, 123, 255, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      fontSize: 11, 
                      color: isCurrentUser ? 'rgba(255,255,255,0.9)' : '#666', 
                      marginBottom: 6, 
                      fontWeight: 600 
                    }}>
                      {isCurrentUser ? 'You' : msg.author} • {msg.time}
                    </div>
                    {msg.text && (
                      <div style={{ 
                        fontSize: 14, 
                        marginBottom: msg.media ? 8 : 0, 
                        wordBreak: 'break-word', 
                        color: isCurrentUser ? '#fff' : (isVideoCallMessage ? '#1976d2' : 'inherit'), 
                        fontWeight: isVideoCallMessage ? 500 : 'normal' 
                      }}>
                        {isVideoCallMessage && <span style={{ marginRight: 6 }}>📹</span>}
                        {msg.text}
                      </div>
                    )}
                    {msg.media && (
                      <div style={{ marginTop: 8 }}>
                        {msg.media.type === 'image' && (
                          <img 
                            src={msg.media.url} 
                            alt={msg.media.filename || 'Image'} 
                            style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, cursor: 'pointer' }}
                            onClick={() => window.open(msg.media!.url, '_blank')}
                          />
                        )}
                        {msg.media.type === 'audio' && (
                          <audio controls style={{ width: '100%', borderRadius: 8 }}>
                            <source src={msg.media.url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        )}
                        {msg.media.type === 'video' && (
                          <video controls style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}>
                            <source src={msg.media.url} type="video/mp4" />
                            Your browser does not support the video element.
                          </video>
                        )}
                        {msg.media.filename && (
                          <div style={{ fontSize: 11, color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#888', marginTop: 4 }}>
                            📎 {msg.media.filename}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
              })
            )}
          </div>
          
          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div style={{ 
              padding: '12px 16px', 
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
              borderRadius: 8, 
              border: '1px solid #90caf9',
              margin: '0 16px 12px 16px'
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#1565c0' }}>
                📎 Selected files ({selectedFiles.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    padding: '6px 10px', 
                    background: '#fff', 
                    borderRadius: 6, 
                    fontSize: 11,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <span style={{ fontSize: 14 }}>{file.type.startsWith('image/') ? '🖼️' : file.type.startsWith('audio/') ? '🎵' : file.type.startsWith('video/') ? '🎥' : '📄'}</span>
                    <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {file.name}
                    </span>
                    <button
                      onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer', 
                        color: '#dc3545', 
                        fontSize: 16, 
                        padding: 0, 
                        width: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Area */}
          <div style={{ 
            padding: '16px',
            borderTop: '1px solid #e6e6e6',
            background: '#fff'
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <button 
                onClick={() => setShowUploadModal(true)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '12px',
                  width: 44,
                  height: 44,
                  background: '#f5f5f5', 
                  border: '1px solid #e6e6e6',
                  borderRadius: 10, 
                  fontSize: 20,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e0e0e0'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                +
              </button>
              <div style={{ flex: 1 }}>
                <input
                  className="input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  style={{ 
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 14,
                    borderRadius: 10,
                    border: '1px solid #e6e6e6'
                  }}
                />
              </div>
              <button 
                className="btn" 
                onClick={sendMessage} 
                disabled={!messageInput.trim() && selectedFiles.length === 0}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  background: (!messageInput.trim() && selectedFiles.length === 0) ? '#ccc' : 'var(--brand)',
                  border: 'none',
                  cursor: (!messageInput.trim() && selectedFiles.length === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (messageInput.trim() || selectedFiles.length > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
              onClick={() => setShowUploadModal(false)}
            >
              <div 
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 24,
                  minWidth: 280,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>Upload</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <button
                    onClick={() => {
                      handleFileSelect('image')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      border: '1px solid #e6e6e6',
                      borderRadius: 8,
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f5f5f5'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#fff'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Image</span>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#fff59d', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 20,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      📷
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleFileSelect('audio')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      border: '1px solid #e6e6e6',
                      borderRadius: 8,
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f5f5f5'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#fff'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Audio</span>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#c8e6c9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 20,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      🎤
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Media Gallery */}
          {pageMedia.length > 0 && (
            <div style={{ 
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e6e6e6',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: '14px 16px',
                borderBottom: '1px solid #e6e6e6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📷</span>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#333' }}>Media Gallery</h3>
                </div>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 8, 
                maxHeight: 220, 
                overflowY: 'auto',
                padding: 12,
                background: '#fafafa'
              }}>
                {pageMedia.map((media, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      position: 'relative', 
                      cursor: 'pointer',
                      borderRadius: 6,
                      overflow: 'hidden',
                      transition: 'transform 0.2s',
                      border: '1px solid #e6e6e6'
                    }} 
                    onClick={() => window.open(media.url, '_blank')}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {media.type === 'image' && (
                      <img 
                        src={media.url} 
                        alt={media.filename} 
                        style={{ width: '100%', height: 70, objectFit: 'cover' }}
                      />
                    )}
                    {media.type === 'audio' && (
                      <div style={{ 
                        width: '100%', 
                        height: 70, 
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: 28 
                      }}>
                        🎵
                      </div>
                    )}
                    {media.type === 'video' && (
                      <div style={{ 
                        width: '100%', 
                        height: 70, 
                        background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: 28 
                      }}>
                        🎥
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            border: '1px solid #e6e6e6',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {/* Members Header */}
            <div style={{
              background: '#f5f5f5',
              color: '#333',
              padding: '14px 16px',
              fontWeight: 700,
              fontSize: 15,
              borderBottom: '1px solid #e6e6e6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>👥</span>
                <span>Members</span>
                <span style={{ 
                  marginLeft: 'auto', 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '2px 8px', 
                  borderRadius: 12, 
                  fontSize: 12 
                }}>
                  {members.length}
                </span>
              </div>
            </div>
            
            {/* Members List */}
            {members.length > 0 && (
              <div style={{ 
                maxHeight: 280, 
                overflowY: 'auto',
                padding: '12px'
              }}>
                {members.map((email) => (
                  <div
                    key={email}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      marginBottom: 8,
                      borderRadius: 8,
                      background: '#fafafa',
                      border: '1px solid #e6e6e6',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f0f0f0'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#fafafa'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#007bff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                        boxShadow: '0 2px 4px rgba(0, 123, 255, 0.3)'
                      }}>
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{email}</span>
                    </div>
                    <button
                      onClick={() => removeMember(email)}
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer', 
                        color: '#dc3545',
                        padding: '6px 10px',
                        fontSize: 12,
                        borderRadius: 6,
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#fee'
                        e.currentTarget.style.color = '#c82333'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#dc3545'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Member Section */}
            <div style={{ 
              padding: '16px',
              background: '#fafafa',
              borderTop: '1px solid #e6e6e6'
            }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  className="input"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  placeholder="Enter user email"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canAddMember) {
                      addMember()
                    }
                  }}
                  style={{ 
                    flex: 1, 
                    fontSize: 13,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e6e6e6'
                  }}
                />
                <button 
                  className="btn btn-secondary" 
                  disabled={!canAddMember} 
                  onClick={addMember}
                  style={{ 
                    fontSize: 13, 
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontWeight: 600
                  }}
                >
                  Add
                </button>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={async () => {
                  const email = window.prompt('Enter user email to add:')
                  if (email && email.trim()) {
                    const trimmed = email.trim()
                    if (members.includes(trimmed)) {
                      window.alert('User is already a member of this page')
                      return
                    }
                    await addMemberWithEmail(trimmed)
                  }
                }}
                style={{ 
                  width: '100%', 
                  fontSize: 13, 
                  padding: '10px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 6,
                  borderRadius: 8,
                  fontWeight: 600
                }}
              >
                <span style={{ fontSize: 16 }}>+</span> Add Member
              </button>
            </div>
          </div>

          {/* Page Operations */}
          <div style={{ 
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e6e6e6',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              padding: '14px 16px',
              borderBottom: '1px solid #e6e6e6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>⚙️</span>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#333' }}>Page Operations</h3>
              </div>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                className="btn btn-secondary" 
                onClick={renamePage}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                ✏️ Rename Page
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={archivePage}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                📦 Archive Page
              </button>
              <button 
                className="btn" 
                onClick={leavePage}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#c82333'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#dc3545'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                🚪 Leave Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
