export type SystemSound = 'key' | 'portrait-line' | 'window-open' | 'error' | 'hover'

let audioContext: AudioContext | null = null
let enabled = true
let bootMusicRequested = false
let bootMusicPlayed = false
let lastHoverSoundAt = 0

const getAudioContext = (): AudioContext | null => {
  if (typeof window.AudioContext === 'undefined') return null
  audioContext ??= new window.AudioContext()
  return audioContext
}

const tone = (
  context: AudioContext,
  frequency: number,
  endFrequency: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'triangle',
) => {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.005)
}

const musicNote = (
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType,
): void => {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.22)
  gain.gain.setValueAtTime(volume, startTime + duration - 0.32)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.01)
}

const playBootSequence = (context: AudioContext): void => {
  if (!enabled || !bootMusicRequested || bootMusicPlayed || context.state !== 'running') return
  bootMusicPlayed = true
  const start = context.currentTime + 0.12
  tone(context, 48, 112, start, 3.2, 0.022, 'sine')
  tone(context, 190, 1120, start + 0.12, 2.65, 0.009, 'sawtooth')
  tone(context, 1700, 420, start + 0.3, 1.8, 0.004, 'sine')

  const arpeggio = [220, 329.63, 440, 659.25, 880, 659.25, 987.77, 1318.51]
  arpeggio.forEach((frequency, noteIndex) => {
    musicNote(context, frequency, start + 0.28 + noteIndex * 0.235, 0.24, 0.008, 'triangle')
  })

  ;[659.25, 880, 1108.73].forEach((frequency) => {
    musicNote(context, frequency, start + 2.55, 0.92, 0.006, 'sine')
  })
}

const resumeAudio = (context: AudioContext): Promise<void> => (
  context.state === 'suspended' ? context.resume() : Promise.resolve()
)

export const requestBootMusic = (): void => {
  bootMusicRequested = true
  if (!enabled) return
  const context = getAudioContext()
  if (context?.state === 'running') playBootSequence(context)
}

export const activateSystemAudio = (): void => {
  if (!enabled) return
  const context = getAudioContext()
  if (!context) return
  void resumeAudio(context).then(() => playBootSequence(context)).catch(() => undefined)
}

export const setSystemSoundsEnabled = (nextEnabled: boolean): void => {
  enabled = nextEnabled
  if (!nextEnabled) return

  const context = getAudioContext()
  if (context?.state === 'suspended') void context.resume().catch(() => undefined)
}

export const playSystemSound = (sound: SystemSound): void => {
  if (!enabled) return
  const context = getAudioContext()
  if (!context) return

  const play = () => {
    if (!enabled || context.state !== 'running') return
    playBootSequence(context)
    const now = context.currentTime

    if (sound === 'hover') {
      const elapsed = performance.now() - lastHoverSoundAt
      if (elapsed < 85) return
      lastHoverSoundAt = performance.now()
    }

    switch (sound) {
      case 'key':
        tone(context, 720, 360, now, 0.045, 0.014)
        break
      case 'portrait-line':
        tone(context, 1080, 680, now, 0.024, 0.006)
        break
      case 'window-open':
        tone(context, 340, 720, now, 0.16, 0.025, 'sine')
        tone(context, 540, 920, now + 0.045, 0.12, 0.012, 'sine')
        break
      case 'error':
        tone(context, 520, 185, now, 0.17, 0.035, 'square')
        tone(context, 420, 150, now + 0.09, 0.14, 0.025, 'square')
        break
      case 'hover':
        tone(context, 1180, 920, now, 0.018, 0.004, 'sine')
        break
    }
  }

  if (context.state === 'suspended') {
    void resumeAudio(context).then(play).catch(() => undefined)
  } else {
    play()
  }
}