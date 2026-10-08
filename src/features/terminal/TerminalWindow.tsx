import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { AsciiPortrait } from '../ascii-portrait/AsciiPortrait'
import { ContactForm } from '../contact/ContactForm'
import { ProfileLinks } from '../profiles/ProfileLinks'
import { ServicesCatalog } from '../services-catalog/ServicesCatalog'
import { SystemResources } from '../system-resources/SystemResources'
import { commandNames } from './commandRegistry'
import { CommandLine } from './components/CommandLine'
import { CommandHUD } from './components/CommandHUD'
import { TerminalOutput } from './components/TerminalOutput'
import type { CommandResult, TerminalAction } from './types'
import { useTerminal } from './useTerminal'
import { playSystemSound } from '../sound/soundEffects'
import './terminal-window.css'

interface DragStart {
  pointerX: number
  pointerY: number
  offsetX: number
  offsetY: number
}

interface TerminalWindowProps {
  booted: boolean
}

export const TerminalWindow = ({ booted }: TerminalWindowProps) => {
  const [activePanel, setActivePanel] = useState<TerminalAction | null>(null)
  const [hudCommand, setHudCommand] = useState<{ command: string; result: CommandResult } | null>(null)
  const { entries, busy, run } = useTerminal(
    setActivePanel,
    (command, result) => setHudCommand({ command, result }),
  )
  const [closed, setClosed] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragStartRef = useRef<DragStart | null>(null)

  useEffect(() => {
    if (booted) playSystemSound('window-open')
  }, [booted])

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    if (maximized || (event.target as HTMLElement).closest('button')) return
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: position.x,
      offsetY: position.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    const dragStart = dragStartRef.current
    if (!dragStart) return
    const boundX = Math.max(0, window.innerWidth * 0.16)
    const boundY = Math.max(0, window.innerHeight * 0.12)
    setPosition({
      x: Math.max(-boundX, Math.min(boundX, dragStart.offsetX + event.clientX - dragStart.pointerX)),
      y: Math.max(-boundY, Math.min(boundY, dragStart.offsetY + event.clientY - dragStart.pointerY)),
    })
  }

  const stopDrag = () => { dragStartRef.current = null }
  const activeDialog = activePanel === 'contact'
    ? <ContactForm onClose={() => setActivePanel(null)} />
    : activePanel === 'services'
      ? <ServicesCatalog onClose={() => setActivePanel(null)} />
      : activePanel === 'resources'
        ? <SystemResources onClose={() => setActivePanel(null)} />
        : null
  const commandHud = hudCommand && !activePanel
    ? <CommandHUD command={hudCommand.command} result={hudCommand.result} onClose={() => setHudCommand(null)} />
    : null

  if (closed) {
    return (
      <>
        <div className="terminal-closed">
          <button className="terminal-reopen" type="button" onClick={() => setClosed(false)}>
            <span aria-hidden="true">▣</span> reopen terminal
          </button>
        </div>
        {activeDialog}
        {commandHud}
      </>
    )
  }

  return (
    <>
      <section
        className={`terminal-window${booted ? ' terminal-window-entering' : ''}${maximized ? ' terminal-window-maximized' : ''}${minimized ? ' terminal-window-minimized' : ''}`}
        style={maximized ? undefined : { transform: `translate(${position.x}px, ${position.y}px)` }}
        aria-label="Terminal portfolio window"
      >
      <header
        className="terminal-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <div className="terminal-window-controls" aria-label="Window controls">
          <button className="terminal-control control-close" type="button" aria-label="Close terminal" onClick={() => setClosed(true)} />
          <button className="terminal-control control-minimize" type="button" aria-label={minimized ? 'Restore terminal' : 'Minimize terminal'} onClick={() => setMinimized((value) => !value)} />
          <button className="terminal-control control-maximize" type="button" aria-label={maximized ? 'Restore terminal size' : 'Maximize terminal'} onClick={() => setMaximized((value) => !value)} />
        </div>
        <div className="terminal-window-title">viral@prajapati: ~ <em>(bash - 80x24)</em></div>
        <div className="terminal-connection"><span /> SSH / ACTIVE</div>
      </header>

      {!minimized && (
        <div className="terminal-window-content">
          <aside className="portrait-pane" aria-label="Engineer profile">
            <div className="portrait-pane-label"><span>01 / IDENTITY</span><span>IMG_0001.ASC</span></div>
            <AsciiPortrait animate={booted} />
            <div className="portrait-caption"><span>FIG 01.01 / SUBJECT <strong>VERIFIED</strong></span><span className="portrait-caption-status">● ONLINE</span></div>
            <div className="portrait-identity">
              <div>
                <h1>Viral Prajapati</h1>
                <p>Backend Engineer <span>·</span> Technical Solutions</p>
              </div>
              <span className="portrait-identity-index">VP_01</span>
            </div>
            <div className="portrait-tags" aria-label="Key skills">
              <span>JAVA</span><span>SPRING</span><span>MICROSERVICES</span><span>KAFKA</span>
            </div>
            <ProfileLinks />
          </aside>

          <section className="shell-pane" aria-label="Interactive shell" onClick={(event) => {
            if (!(event.target as HTMLElement).closest('a, button, input')) {
              document.getElementById('terminal-command')?.focus()
            }
          }}>
            <div className="shell-pane-topline"><span>INTERACTIVE SHELL <strong>●</strong></span><span>UTF-8&nbsp; / &nbsp;BASH</span></div>
            <TerminalOutput entries={entries} busy={busy} />
            <CommandLine commandNames={commandNames} disabled={busy} onSubmit={run} />
          </section>
        </div>
      )}
      </section>
      {activeDialog}
      {commandHud}
    </>
  )
}
