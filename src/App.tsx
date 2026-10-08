import { useEffect, useState, type PointerEvent } from 'react'
import { BootScreen } from './features/boot-screen/BootScreen'
import { MatrixRainCanvas } from './features/matrix-rain/MatrixRainCanvas'
import { ProfessionalProfile } from './features/professional-profile/ProfessionalProfile'
import { TerminalWindow } from './features/terminal/TerminalWindow'
import { activateSystemAudio, playSystemSound, requestBootMusic, setSystemSoundsEnabled } from './features/sound/soundEffects'
import './styles/app-shell.css'

const App = () => {
  const [booting, setBooting] = useState(true)
  const [scanlines, setScanlines] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => { requestBootMusic() }, [])

  const playHoverCue = (event: PointerEvent<HTMLElement>) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const interactive = target.closest('a, button, [role="button"], [data-sound-hover]')
    if (!interactive) return

    const previousTarget = event.relatedTarget
    if (previousTarget instanceof Element && previousTarget.closest('a, button, [role="button"], [data-sound-hover]') === interactive) return
    playSystemSound('hover')
  }

  const toggleSound = () => {
    const nextEnabled = !soundEnabled
    setSoundEnabled(nextEnabled)
    setSystemSoundsEnabled(nextEnabled)
    if (nextEnabled) {
      activateSystemAudio()
      playSystemSound('window-open')
    }
  }

  return (
    <main className={`portfolio-shell${scanlines ? ' scanlines-enabled' : ''}`} onPointerOver={playHoverCue}>
      <MatrixRainCanvas />
      {booting && <BootScreen onComplete={() => setBooting(false)} />}
      <header className="site-header">
        <a className="site-wordmark" href="#top" aria-label="Viral Prajapati home">
          <span className="site-mark">V_</span>
          <span>VIRAL PRAJAPATI</span>
        </a>
        <div className="availability-status"><span />AVAILABLE FOR SELECT PROJECTS</div>
        <button
          className="sound-toggle"
          type="button"
          aria-pressed={soundEnabled}
          onClick={toggleSound}
          title={soundEnabled ? 'Mute system sounds' : 'Enable system sounds'}
        >
          <span aria-hidden="true">♪</span> SFX <b>{soundEnabled ? 'ON' : 'OFF'}</b>
        </button>
        <button
          className="scanline-toggle"
          type="button"
          aria-pressed={scanlines}
          onClick={() => setScanlines((enabled) => !enabled)}
        >
          <span aria-hidden="true">▤</span> SCANLINES <b>{scanlines ? 'ON' : 'OFF'}</b>
        </button>
      </header>

      <section className="portfolio-desktop" id="top" aria-label="Interactive portfolio terminal">
        <div className="desktop-meta"><span><i>01</i> PERSONNEL FILE / 2026</span><span>37°33' N&nbsp; / &nbsp;126°58' E</span></div>
        <TerminalWindow booted={!booting} />
        <footer className="desktop-footer">
          <span>ENGINEERED FOR THE OPEN WEB</span>
          <span>SESSION <b>ENCRYPTED</b> <i aria-hidden="true">◆</i></span>
          <span>BUILD 26.10.07 <b>_</b></span>
        </footer>
      </section>
      <div className="portfolio-desktop">
        <ProfessionalProfile />
      </div>
    </main>
  )
}

export default App
