import { useEffect, useState, useCallback } from 'react'
import { Modal } from '../../../components/Modal'
import { voiceChatService } from '../../../services/voiceChat'
import type { VoiceChatState } from '../../../services/voiceChatTypes'
import './voice-chat.css'

interface VoiceChatProps {
  onClose: () => void
}

export const VoiceChat = ({ onClose }: VoiceChatProps) => {
  const [state, setState] = useState<VoiceChatState>({
    status: 'connecting',
    transcript: [],
    isListening: false,
    error: null
  })

  useEffect(() => {
    // Subscribe to service state changes
    const unsubscribe = voiceChatService.subscribe(setState)
    
    // Initialize connection
    voiceChatService.connect().catch(err => {
      console.error('Failed to connect to voice agent:', err)
    })

    return () => {
      unsubscribe()
      voiceChatService.disconnect()
    }
  }, [])

  const startListening = useCallback(async () => {
    try {
      await voiceChatService.startListening()
    } catch (err) {
      console.error('Failed to start listening:', err)
    }
  }, [])

  const stopListening = useCallback(async () => {
    await voiceChatService.stopListening()
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.code === 'Space' && !state.isListening && state.status === 'connected') {
      e.preventDefault()
      startListening()
    }
  }, [state.isListening, state.status, startListening, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <Modal title="/voice" eyebrow="VOICE AGENT / SALES EXECUTIVE" onClose={onClose}>
      <section className="voice-chat-container" aria-label="Voice chat with AI sales agent">
        <div className="voice-status-bar">
          <div className={`voice-status-indicator ${state.status}`}>
            <span className="status-dot" />
            <span className="status-text">
              {state.status === 'connecting' ? 'CONNECTING...' : 
               state.status === 'connected' ? '● LIVE' : 
               state.status === 'disconnected' ? 'DISCONNECTED' : 'CONNECTION ERROR'}
            </span>
          </div>
          <div className="voice-controls">
            <button 
              className={`voice-btn ${state.isListening ? 'listening' : ''}`}
              onClick={state.isListening ? stopListening : startListening}
              disabled={state.status !== 'connected'}
              aria-label={state.isListening ? 'Stop listening' : 'Start talking'}
            >
              <span className="btn-icon">{state.isListening ? '●' : '◎'}</span>
              <span className="btn-text">{state.isListening ? 'LISTENING...' : 'HOLD SPACE TO TALK'}</span>
            </button>
            <div className="voice-hint">Press SPACE or click to speak</div>
          </div>
        </div>

        <div className="voice-transcript" role="log" aria-live="polite">
          {state.transcript.length === 0 ? (
            <div className="transcript-empty">
              <div className="empty-icon">🎙️</div>
              <p>Voice agent ready. Start speaking to begin the conversation.</p>
              <p className="hint">The agent will act as a sales executive to book discovery calls for Viral's services.</p>
            </div>
          ) : (
            state.transcript.map((msg, idx) => (
              <div key={idx} className={`transcript-message ${msg.role}`}>
                <span className="msg-label">{msg.role === 'user' ? 'YOU' : 'AGENT'}</span>
                <span className="msg-text">{msg.text}</span>
              </div>
            ))
          )}
        </div>

        {state.error && (
          <div className="voice-error" role="alert">
            ⚠ {state.error}
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