import type { VoiceChatState } from './voiceChatTypes'

const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:8080'

export class VoiceChatService {
  private ws: WebSocket | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private audioChunks: Blob[] = []
  private sessionId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private listeners: Set<(state: VoiceChatState) => void> = new Set()
  
  // Reactive state
  public state: VoiceChatState = {
    status: 'disconnected',
    transcript: [],
    isListening: false,
    error: null
  }
  
  constructor() {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: VoiceChatState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  private notify(): void {
    this.listeners.forEach(listener => listener(this.state))
  }
  
  private setState(partial: Partial<VoiceChatState>): void {
    this.state = { ...this.state, ...partial }
    this.notify()
  }
  
  /**
   * Connect to the Pipecat WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }
    
    this.setState({ status: 'connecting', error: null })
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${WS_BASE}/api/voice/stream`)
        
        this.ws.onopen = () => {
          console.log('Voice chat WebSocket connected')
          this.setState({ status: 'connected' })
          this.reconnectAttempts = 0
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event)
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.setState({ error: 'Connection error', status: 'error' })
          reject(error)
        }
        
        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          this.setState({ status: 'disconnected' })
          this.handleReconnect()
        }
        
        // Send session start frame
        this.sendFrame({
          frameType: 'SystemFrame',
          command: 'SESSION_START',
          payload: { sessionId: this.sessionId }
        })
        
      } catch (error) {
        this.setState({ status: 'error', error: 'Failed to connect to voice server' })
        reject(error)
      }
    })
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      if (event.data instanceof Blob) {
        // Binary audio data from TTS
        this.playAudioBlob(event.data)
        return
      }
      
      // Text frame (JSON)
      const frame = JSON.parse(event.data)
      this.handleFrame(frame)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }
  
  /**
   * Handle parsed frame from server
   */
  private handleFrame(frame: any): void {
    switch (frame.frameType) {
      case 'TranscriptionFrame':
        if (frame.isFinal) {
          this.addToTranscript('user', frame.text)
        }
        break
        
      case 'LLMResponseFrame':
        this.addToTranscript('assistant', frame.text)
        break
        
      case 'AudioRawFrame':
        // Audio is handled as binary blob
        break
        
      case 'UserStartedSpeakingFrame':
        console.log('VAD: User started speaking')
        break
        
      case 'UserStoppedSpeakingFrame':
        console.log('VAD: User stopped speaking')
        break
        
      case 'InterruptionFrame':
        console.log('Interruption:', frame.reason)
        this.stopListening()
        break
        
      case 'ErrorFrame':
        this.setState({ error: frame.message, status: 'error' })
        break
        
      case 'SystemFrame':
        if (frame.command === 'HEARTBEAT') {
          // Keep alive
        }
        break
    }
  }
  
  /**
   * Add message to transcript
   */
  private addToTranscript(role: 'user' | 'assistant', text: string): void {
    this.setState({
      transcript: [...this.state.transcript, {
        role,
        text,
        timestamp: Date.now()
      }]
    })
  }
  
  /**
   * Send a frame to the server
   */
  private sendFrame(frame: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...frame,
        sessionId: this.sessionId
      }))
    }
  }
  
  /**
   * Send binary audio data to server
   */
  private sendAudio(audioData: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(audioData)
    }
  }
  
  /**
   * Start recording audio from microphone
   */
  async startListening(): Promise<void> {
    if (this.state.isListening) return
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      this.audioContext = new AudioContext({ sampleRate: 16000 })
      this.audioContext.createMediaStreamSource(stream)
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        await this.sendAudioBlob(audioBlob)
      }
      
      this.mediaRecorder.start(100) // Send chunks every 100ms
      this.setState({ isListening: true })
      
    } catch (error) {
      console.error('Failed to start listening:', error)
      this.setState({ error: 'Microphone access denied', status: 'error' })
      throw error
    }
  }
  
  /**
   * Stop recording and send audio
   */
  async stopListening(): Promise<void> {
    if (!this.state.isListening || !this.mediaRecorder) return
    
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
          await this.sendAudioBlob(audioBlob)
          resolve()
        }
        this.mediaRecorder.stop()
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
      
      this.setState({ isListening: false })
      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }
    })
  }
  
  /**
   * Send recorded audio blob to server
   */
  private async sendAudioBlob(blob: Blob): Promise<void> {
    const arrayBuffer = await blob.arrayBuffer()
    this.sendAudio(arrayBuffer)
  }
  
  /**
   * Play audio blob from server (TTS output)
   */
  private async playAudioBlob(blob: Blob): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext()
      }
      
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.audioContext.destination)
      source.start(0)
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }
  
  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`)
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts)
    } else {
      this.setState({ error: 'Max reconnection attempts reached', status: 'error' })
    }
  }
  
  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    this.setState({ status: 'disconnected', isListening: false })
  }
  
  /**
   * Clear transcript
   */
  clearTranscript(): void {
    this.setState({ transcript: [] })
  }
  
  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId
  }
}

// Singleton instance
export const voiceChatService = new VoiceChatService()