import { useEffect, useRef, useState } from 'react'
import { executeCommand } from './commandRegistry'
import { playSystemSound } from '../sound/soundEffects'
import type { CommandResult, TerminalAction, TerminalEntry } from './types'

export const useTerminal = (
  onAction: (action: TerminalAction) => void,
  onHud: (command: string, result: CommandResult) => void,
) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [busy, setBusy] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => {
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
  }, [])

  const run = (command: string) => {
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
    const result = executeCommand(command)
    if (result.error) playSystemSound('error')
    if (result.clear) {
      setEntries([])
      setBusy(false)
      return
    }

    if (result.delayMs) {
      setBusy(true)
      timeoutRef.current = window.setTimeout(() => {
        setEntries((current) => [...current, { command, result }])
        setBusy(false)
        if (result.action) onAction(result.action)
        else if (result.lines.length > 0) onHud(command, result)
        timeoutRef.current = undefined
      }, result.delayMs)
    } else {
      setEntries((current) => [...current, { command, result }])
      setBusy(false)
      if (result.action) onAction(result.action)
      else if (result.lines.length > 0) onHud(command, result)
    }
  }

  return { entries, busy, run }
}
