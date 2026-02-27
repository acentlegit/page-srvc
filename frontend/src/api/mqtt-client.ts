import mqtt, { MqttClient, IClientOptions } from 'mqtt'

export type BeamContext = {
  tenantId: string
  ecosystem: string
  sessionId: string
  actorUserId: string
  requestId: string
  timestamp: number
}

export type BeamCommand<T> = {
  ctx: BeamContext
  body: T
}

export type MqttReply = {
  ok: boolean
  result?: any
  error?: string
}

class MqttService {
  private client: MqttClient | null = null
  private pendingRequests = new Map<string, { resolve: (value: any) => void; reject: (error: any) => void; timeout: NodeJS.Timeout }>()
  private isConnected = false
  private connectionPromise: Promise<void> | null = null

  private getConfig() {
    // Read from .env file - MQTT configuration
    const primaryUrl = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:9001'
    const queueName = import.meta.env.VITE_MQTT_QUEUE_NAME || 'beam-pages'
    const clientId = import.meta.env.VITE_MQTT_CLIENT_ID || 'beam-admin-frontend'
    const subscriptionTopic = import.meta.env.VITE_MQTT_SUBSCRIPTION_TOPIC || 'pages/+'
    const username = import.meta.env.VITE_MQTT_USERNAME
    const password = import.meta.env.VITE_MQTT_PASSWORD
    const tenantId = import.meta.env.VITE_TENANT_ID || 'acente-prod'
    const ecosystem = import.meta.env.VITE_ECOSYSTEM || 'sandbox'
    
    // Fallback URLs to try if primary fails (for staging environment)
    const isStaging = primaryUrl.includes('staging') || primaryUrl.includes('beamdev.hu')
    const fallbackUrls = isStaging ? [
      // Try non-secure first (often more reliable)
      'ws://mqtt.staging.beamdev.hu:9001',
      'ws://mqtt.staging.beamdev.hu:8080',
      'ws://mqtt.staging.beamdev.hu:1883',
      // Then try secure with different paths
      'wss://mqtt.staging.beamdev.hu:443/mqtt',
      'wss://mqtt.staging.beamdev.hu:443/ws',
      'wss://mqtt.staging.beamdev.hu:8883/mqtt',
      // Alternative domains
      'ws://staging.beamdev.hu:9001',
      'wss://staging.beamdev.hu:443/mqtt',
    ] : []
    
    return { 
      mqttUrl: primaryUrl, 
      fallbackUrls,
      queueName, 
      clientId, 
      subscriptionTopic, 
      username, 
      password, 
      tenantId, 
      ecosystem 
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return Promise.resolve()
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    const config = this.getConfig()
    const { mqttUrl, fallbackUrls, username, password, clientId } = config
    
    // Try primary URL first, then fallbacks
    const urlsToTry = [mqttUrl, ...fallbackUrls.filter(url => url !== mqttUrl)]
    
    this.connectionPromise = this.tryConnect(urlsToTry, { username, password, clientId })
    return this.connectionPromise
  }

  private async tryConnect(urls: string[], options: { username?: string; password?: string; clientId: string }): Promise<void> {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      const isLast = i === urls.length - 1
      
      try {
        console.log(`🔌 Attempting MQTT connection to: ${url}${isLast ? ' (last attempt)' : ''}`)
        
        const result = await this.attemptConnection(url, options)
        if (result.success) {
          console.log(`✅ MQTT connected successfully to: ${url}`)
          return Promise.resolve()
        } else {
          console.warn(`⚠️ Connection failed: ${result.error}`)
          if (!isLast) {
            console.log(`🔄 Trying next URL...`)
          }
        }
      } catch (error: any) {
        console.warn(`⚠️ Connection attempt failed: ${error.message}`)
        if (!isLast) {
          console.log(`🔄 Trying next URL...`)
        }
      }
    }
    
    // All URLs failed
    const error = new Error(`Failed to connect to MQTT broker. Tried ${urls.length} URL(s).`)
    console.error('❌ MQTT connection failed after trying all URLs:', urls)
    throw error
  }

  private attemptConnection(mqttUrl: string, options: { username?: string; password?: string; clientId: string }): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const mqttOptions: IClientOptions = {
        reconnectPeriod: 0, // Disable auto-reconnect for testing
        connectTimeout: 8000,
        clientId: `${options.clientId}-${Date.now()}`,
        rejectUnauthorized: false, // Allow self-signed certificates for staging
        ...(options.username && options.password ? { username: options.username, password: options.password } : {}),
      }

      const testClient = mqtt.connect(mqttUrl, mqttOptions)
      
      const timeout = setTimeout(() => {
        testClient.end(true)
        resolve({ success: false, error: 'Connection timeout' })
      }, 8000)

      testClient.on('connect', () => {
        clearTimeout(timeout)
        // Close test client and create real connection
        testClient.end(true)
        
        // Create the actual client connection
        const actualOptions: IClientOptions = {
          reconnectPeriod: 5000,
          connectTimeout: 10000,
          clientId: options.clientId,
          rejectUnauthorized: false, // Allow self-signed certificates for staging
          ...(options.username && options.password ? { username: options.username, password: options.password } : {}),
        }

        this.client = mqtt.connect(mqttUrl, actualOptions)

        this.client.on('connect', () => {
          console.log('✅ MQTT connected:', mqttUrl)
          this.isConnected = true
          this.connectionPromise = null
        })

        this.client.on('error', (error) => {
          console.error('MQTT error:', error)
          this.isConnected = false
        })

        this.client.on('disconnect', () => {
          console.warn('MQTT disconnected')
          this.isConnected = false
        })

        this.client.on('message', (topic, payload) => {
          this.handleMessage(topic, payload)
        })

        resolve({ success: true })
      })

      testClient.on('error', (error) => {
        clearTimeout(timeout)
        testClient.end(true)
        resolve({ success: false, error: error.message || 'Connection error' })
      })
    })
  }

  private handleMessage(topic: string, payload: Buffer) {
    try {
      const reply = JSON.parse(payload.toString()) as MqttReply
      
      // Extract requestId from topic: service/page/reply/{requestId}
      const match = topic.match(/service\/page\/reply\/(.+)/)
      if (!match) return

      const requestId = match[1]
      const pending = this.pendingRequests.get(requestId)
      
      if (pending) {
        clearTimeout(pending.timeout)
        this.pendingRequests.delete(requestId)
        
        if (reply.ok) {
          pending.resolve(reply.result)
        } else {
          pending.reject(new Error(reply.error || 'MQTT request failed'))
        }
      }
    } catch (error) {
      console.error('Failed to parse MQTT reply:', error)
    }
  }

  private createContext(actorUserId: string): BeamContext {
    const { tenantId, ecosystem } = this.getConfig()
    return {
      tenantId,
      ecosystem,
      sessionId: `session-${Date.now()}-${Math.random()}`,
      actorUserId,
      requestId: `req-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }
  }

  async request<T>(topic: string, body: any, actorUserId: string = 'admin', timeout: number = 5000): Promise<T> {
    await this.connect()

    if (!this.client || !this.isConnected) {
      throw new Error('MQTT client not connected')
    }

    const ctx = this.createContext(actorUserId)
    const command: BeamCommand<any> = { ctx, body }

    return new Promise<T>((resolve, reject) => {
      const replyTopic = `service/page/reply/${ctx.requestId}`
      
      // Subscribe to reply topic
      this.client!.subscribe(replyTopic, { qos: 0 }, (err) => {
        if (err) {
          reject(err)
          return
        }

        // Store pending request
        const timeoutId = setTimeout(() => {
          this.pendingRequests.delete(ctx.requestId)
          this.client!.unsubscribe(replyTopic)
          reject(new Error(`MQTT request timeout after ${timeout}ms`))
        }, timeout)

        this.pendingRequests.set(ctx.requestId, {
          resolve: (result) => {
            this.client!.unsubscribe(replyTopic)
            resolve(result)
          },
          reject: (error) => {
            this.client!.unsubscribe(replyTopic)
            reject(error)
          },
          timeout: timeoutId,
        })

        // Publish command
        this.client!.publish(topic, JSON.stringify(command), { qos: 0 }, (pubErr) => {
          if (pubErr) {
            clearTimeout(timeoutId)
            this.pendingRequests.delete(ctx.requestId)
            this.client!.unsubscribe(replyTopic)
            reject(pubErr)
          }
        })
      })
    })
  }

  private subscriptions = new Map<string, Set<(payload: any) => void>>()

  subscribe(topic: string, callback: (payload: any) => void) {
    // Store callback for this topic
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set())
    }
    this.subscriptions.get(topic)!.add(callback)

    // If not connected, connect first
    if (!this.client || !this.isConnected) {
      this.connect().then(() => {
        this.subscribe(topic, callback)
      }).catch((err) => {
        console.error(`Failed to connect for subscription to ${topic}:`, err)
      })
      return
    }

    // Subscribe to topic if not already subscribed
    this.client.subscribe(topic, { qos: 0 }, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${topic}:`, err)
        return
      }
      console.log(`✅ Subscribed to ${topic}`)
    })

    // Set up message handler (only once per topic)
    if (!this.subscriptions.has(topic + '_handler_setup')) {
      this.client.on('message', (msgTopic, payload) => {
        const callbacks = this.subscriptions.get(msgTopic)
        if (callbacks) {
          try {
            const data = JSON.parse(payload.toString())
            console.log(`📨 MQTT message received on ${msgTopic}:`, data)
            callbacks.forEach(cb => {
              try {
                cb(data)
              } catch (error) {
                console.error(`Error in subscription callback for ${msgTopic}:`, error)
              }
            })
          } catch (error) {
            console.error(`Failed to parse MQTT message on ${msgTopic}:`, error)
            console.error('Raw payload:', payload.toString())
          }
        }
      })
      this.subscriptions.set(topic + '_handler_setup', new Set())
    }
  }

  unsubscribe(topic: string, callback?: (payload: any) => void) {
    if (callback) {
      const callbacks = this.subscriptions.get(topic)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.subscriptions.delete(topic)
          if (this.client) {
            this.client.unsubscribe(topic)
          }
        }
      }
    } else {
      this.subscriptions.delete(topic)
      if (this.client) {
        this.client.unsubscribe(topic)
      }
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end(true)
      this.client = null
      this.isConnected = false
    }
  }
}

export const mqttService = new MqttService()
