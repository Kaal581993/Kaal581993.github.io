import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useTypingSound } from '../useTypingSound'
import './command-line.css'

interface CommandLineProps {
  commandNames: string[]
  disabled: boolean
  onSubmit: (command: string) => void
}

export const CommandLine = ({ commandNames, disabled, onSubmit }: CommandLineProps) => {
  const [value, setValue] = useState('')
  const [cursorIndex, setCursorIndex] = useState(0)
  const [focused, setFocused] = useState(true)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const playTypingSound = useTypingSound()

  useEffect(() => {
    if (!disabled && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [disabled])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const command = value.trim()
    if (!command || disabled) return
    setHistory((current) => [...current, command])
    setHistoryIndex(-1)
    setValue('')
    setCursorIndex(0)
    onSubmit(command)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      playTypingSound()
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      if (history.length === 0) return
      const nextIndex = event.key === 'ArrowUp'
        ? Math.min(historyIndex + 1, history.length - 1)
        : Math.max(historyIndex - 1, -1)
      setHistoryIndex(nextIndex)
      setValue(nextIndex === -1 ? '' : history[history.length - 1 - nextIndex])
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      const matches = commandNames.filter((command) => command.startsWith(value.toLowerCase()))
      if (matches.length === 1) {
        setValue(matches[0])
      } else if (matches.length > 1) {
        const sharedPrefix = matches.reduce((prefix, command) => {
          let length = 0
          while (length < prefix.length && prefix[length] === command[length]) length += 1
          return prefix.slice(0, length)
        })
        setValue(sharedPrefix)
      }
    }
  }

  return (
    <form className="command-line" onSubmit={submit}>
      <label className="command-prompt" htmlFor="terminal-command">viral@matrix:~$</label>
      <span className="command-input-wrap">
        <input
          ref={inputRef}
          id="terminal-command"
          className="command-input"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setCursorIndex(event.currentTarget.selectionStart ?? event.target.value.length)
          }}
          onKeyDown={handleKeyDown}
          onSelect={() => setCursorIndex(inputRef.current?.selectionStart ?? value.length)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal command"
          disabled={disabled}
        />
        {focused && <span className="command-cursor" style={{ left: `${cursorIndex * 6.6}px` }} aria-hidden="true" />}
      </span>
      <button className="command-run" type="submit" disabled={disabled || !value.trim()} aria-label="Run command">↵</button>
    </form>
  )
}
