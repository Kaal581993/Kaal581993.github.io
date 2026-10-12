export interface VoiceChatMessage {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

export interface VoiceChatState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  transcript: VoiceChatMessage[]
  isListening: boolean
  error: string | null
}