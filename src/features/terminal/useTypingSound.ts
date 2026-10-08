import { playSystemSound } from '../sound/soundEffects'

export const useTypingSound = () => {
  return () => playSystemSound('key')
}