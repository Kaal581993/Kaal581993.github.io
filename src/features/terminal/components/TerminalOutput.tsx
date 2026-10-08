import { useEffect, useRef } from 'react'
import type { OutputTone, TerminalEntry } from '../types'
import './terminal-output.css'

interface TerminalOutputProps {
  entries: TerminalEntry[]
  busy: boolean
}

const toneClass: Record<OutputTone, string> = {
  default: '',
  accent: 'output-accent',
  muted: 'output-muted',
  cyan: 'output-cyan',
}

export const TerminalOutput = ({ entries, busy }: TerminalOutputProps) => {
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const output = outputRef.current
    if (output) output.scrollTop = output.scrollHeight
  }, [entries, busy])

  return (
    <div ref={outputRef} className="terminal-output" role="log" aria-live="polite" aria-relevant="additions text">
      <div className="terminal-boot-message">
        <span className="boot-title">KAALS OS <span>v. 2.6.10</span></span>
        <span>Secure shell established. Welcome back to Vir'hul's portfolio.</span>
        <span className="boot-muted">Type <b>help</b> to inspect available commands.</span>
      </div>
      {entries.map((entry, entryIndex) => (
        <article className="terminal-entry" key={`${entry.command}-${entryIndex}`}>
          <div className="entry-command"><span>viral@matrix:~$</span> {entry.command}</div>
          {entry.result.lines.map((outputLine, lineIndex) => (
            <div className="output-line" key={`${entryIndex}-${lineIndex}`}>
              {outputLine.segments.map((segment, segmentIndex) => {
                const className = segment.tone ? toneClass[segment.tone] : undefined
                return segment.href ? (
                  <a className={className} href={segment.href} key={segmentIndex} target={segment.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {segment.text}
                  </a>
                ) : (
                  <span className={className} key={segmentIndex}>{segment.text}</span>
                )
              })}
            </div>
          ))}
        </article>
      ))}
      {busy && <div className="terminal-thinking" aria-label="Processing command">processing<span>_</span></div>}
    </div>
  )
}
