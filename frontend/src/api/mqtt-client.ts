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
    const mqttUrl = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:9001'
    const queueName = import.meta.env.VITE_MQTT_QUEUE_NAME || 'beam-pages'
    const clientId = import.meta.env.VITE_MQTT_CLIENT_ID || 'beam-admin-frontend'
    const subscriptionTopic = import.meta.env.VITE_MQTT_SUBSCRIPTION_TOPIC || 'pages/+'
    const username = import.meta.env.VITE_MQTT_USERNAME
    const password = import.meta.env.VITE_MQTT_PASSWORD
    const tenantId = import.meta.env.VITE_TENANT_ID || 'acente-prod'
    const ecosystem = import.meta.env.VITE_ECOSYSTEM || 'sandbox'
    
    return { mqttUrl, queueName, clientId, subscriptionTopic, username, password, tenantId, ecosystem }
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return Promise.resolve()
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const { mqttUrl } = this.getConfig()
      
      const { username, password, clientId } = this.getConfig()
      
      const options: IClientOptions = {
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        clientId: clientId,
        ...(username && password ? { username, password } : {}),
      }

      this.client = mqtt.connect(mqttUrl, options)

      this.client.on('connect', () => {
        console.log('✅ MQTT connected:', mqttUrl)
        this.isConnected = true
        this.connectionPromise = null
        resolve()
      })

      this.client.on('error', (error) => {
        console.error('MQTT error:', error)
        this.isConnected = false
        this.connectionPromise = null
        reject(error)
      })

      this.client.on('disconnect', () => {
        console.warn('MQTT disconnected')
        this.isConnected = false
      })

      this.client.on('message', (topic, payload) => {
        this.handleMessage(topic, payload)
      })
    })

    return this.connectionPromise
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

  subscribe(topic: string, callback: (payload: any) => void) {
    if (!this.client || !this.isConnected) {
      this.connect().then(() => {
        this.subscribe(topic, callback)
      })
      return
    }

    this.client.subscribe(topic, { qos: 0 }, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${topic}:`, err)
        return
      }
      console.log(`✅ Subscribed to ${topic}`)
    })

    this.client.on('message', (msgTopic, payload) => {
      if (msgTopic === topic) {
        try {
          const data = JSON.parse(payload.toString())
          callback(data)
        } catch (error) {
          console.error('Failed to parse MQTT message:', error)
        }
      }
    })
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
