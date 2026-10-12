import { useEffect, useRef, useState } from 'react'
import { Modal } from '../../../components/Modal'
import './voice-chat.css'

interface VoiceChatProps {
  onClose: () => void
}

export const VoiceChat = ({ onClose }: VoiceChatProps) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [transcript, setTranscript] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const websocketRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    initializeVoiceConnection()
    return () => cleanup()
  }, [])

  const initializeVoiceConnection = async () => {
    try {
      setStatus('connecting')
      setError(null)

      // For demo purposes, we'll simulate the connection
      // In production, this would connect to a Pipecat backend via WebSocket
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate successful connection
      setStatus('connected')
      addAssistantMessage("Hello! I'm Viral's AI Sales Executive. I help engineering leaders and founders solve their backend scaling, production stability, and architecture challenges. What's the biggest technical bottleneck keeping you up at night?")
    } catch (err) {
      setStatus('error')
      setError('Failed to connect to voice agent. Please try again.')
    }
  }

  const addAssistantMessage = (text: string) => {
    setTranscript(prev => [...prev, { role: 'assistant', text }])
  }

  const addUserMessage = (text: string) => {
    setTranscript(prev => [...prev, { role: 'user', text }])
  }

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      audioContextRef.current.createMediaStreamSource(stream)
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await sendAudioToAgent(audioBlob)
      }

      mediaRecorderRef.current.start(100)
      setIsListening(true)
      setStatus('connected')
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.')
      setStatus('error')
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    setIsListening(false)
  }

  const sendAudioToAgent = async (_audioBlob: Blob) => {
    // In production, send to Pipecat backend via WebSocket
    // For demo, simulate AI response
    setStatus('connecting')
    
    // Simulate speech-to-text
    const mockUserText = "I'm interested in hiring a backend developer for our Spring Boot microservices."
    addUserMessage(mockUserText)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate AI response based on sales prompt
    const mockResponse = "Excellent — Spring Boot microservices at scale is exactly where Viral shines. He's architected event-driven systems with Kafka handling 50K+ events/sec and reduced consumer lag by 80% for a FinTech client. Tell me: what's your current pain point? Consumer lag? Deployment failures? Database bottlenecks? The more specific, the better I can match Viral's experience to your needs."
    addAssistantMessage(mockResponse)
    
    setStatus('connected')
  }

  const cleanup = () => {
    stopListening()
    if (audioContextRef.current) audioContextRef.current.close()
    if (websocketRef.current) websocketRef.current.close()
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.code === 'Space' && !isListening && status === 'connected') {
      e.preventDefault()
      startListening()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isListening, status])

  return (
    <Modal title="/voice" eyebrow="VOICE AGENT / SALES EXECUTIVE" onClose={onClose}>
      <section className="voice-chat-container" aria-label="Voice chat with AI sales agent">
        <div className="voice-status-bar">
          <div className={`voice-status-indicator ${status}`}>
            <span className="status-dot" />
            <span className="status-text">
              {status === 'connecting' ? 'CONNECTING...' : 
               status === 'connected' ? '● LIVE' : 
               status === 'disconnected' ? 'DISCONNECTED' : 'CONNECTION ERROR'}
            </span>
          </div>
          <div className="voice-controls">
            <button 
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={status !== 'connected'}
              aria-label={isListening ? 'Stop listening' : 'Start talking'}
            >
              <span className="btn-icon">{isListening ? '●' : '◎'}</span>
              <span className="btn-text">{isListening ? 'LISTENING...' : 'HOLD SPACE TO TALK'}</span>
            </button>
            <div className="voice-hint">Press SPACE or click to speak</div>
          </div>
        </div>

        <div className="voice-transcript" role="log" aria-live="polite">
          {transcript.length === 0 ? (
            <div className="transcript-empty">
              <div className="empty-icon">🎙️</div>
              <p>Voice agent ready. Start speaking to begin the conversation.</p>
              <p className="hint">The agent will act as a sales executive to book discovery calls for Viral's services.</p>
            </div>
          ) : (
            transcript.map((msg, idx) => (
              <div key={idx} className={`transcript-message ${msg.role}`}>
                <span className="msg-label">{msg.role === 'user' ? 'YOU' : 'AGENT'}</span>
                <span className="msg-text">{msg.text}</span>
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="voice-error" role="alert">
            ⚠ {error}
          </div>
        )}

        <div className="voice-footer">
          <div className="voice-shortcuts">
            <kbd>SPACE</kbd> Talk  |  <kbd>ESC</kbd> Close  |  <kbd>ENTER</kbd> Send text
          </div>
          <button className="voice-end-btn" onClick={onClose}>END SESSION</button>
        </div>
      </section>
    </Modal>
  )
}