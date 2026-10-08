import { Modal } from '../../../components/Modal'
import type { CommandResult, OutputTone } from '../types'
import './command-hud.css'

interface CommandHUDProps {
  command: string
  result: CommandResult
  onClose: () => void
}

const toneClass: Record<OutputTone, string> = {
  default: '',
  accent: 'hud-output-accent',
  muted: 'hud-output-muted',
  cyan: 'hud-output-cyan',
}

export const CommandHUD = ({ command, result, onClose }: CommandHUDProps) => (
  <Modal title={`/${command}`} eyebrow="COMMAND RESPONSE / HUD" onClose={onClose}>
    <section className="command-hud-content" aria-label={`${command} command details`}>
      <div className="command-hud-status"><span /> DATA DECRYPTED <span>SESSION / 01</span></div>
      <div className="command-hud-lines">
        {result.lines.map((outputLine, lineIndex) => (
          <p className="command-hud-line" key={lineIndex}>
            {outputLine.segments.map((segment, segmentIndex) => {
              const className = segment.tone ? toneClass[segment.tone] : undefined
              return segment.href ? (
                <a className={className} href={segment.href} target={segment.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" key={segmentIndex}>
                  {segment.text}
                </a>
              ) : (
                <span className={className} key={segmentIndex}>{segment.text}</span>
              )
            })}
          </p>
        ))}
      </div>
      <footer className="command-hud-footer"><span>END OF RESPONSE</span><button type="button" onClick={onClose}>RETURN TO TERMINAL <span aria-hidden="true">↵</span></button></footer>
    </section>
  </Modal>
)
