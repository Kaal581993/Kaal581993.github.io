export type OutputTone = 'default' | 'accent' | 'muted' | 'cyan' | 'orange' | 'yellow' | 'amber' | 'coral'
export type TerminalAction = 'contact' | 'services' | 'resources' | 'voice'

export interface OutputSegment {
  text: string
  tone?: OutputTone
  href?: string
}

export interface OutputLine {
  segments: OutputSegment[]
}

export interface CommandResult {
  lines: OutputLine[]
  delayMs?: number
  clear?: boolean
  action?: TerminalAction
  error?: boolean
}

export interface TerminalEntry {
  command: string
  result: CommandResult
}
