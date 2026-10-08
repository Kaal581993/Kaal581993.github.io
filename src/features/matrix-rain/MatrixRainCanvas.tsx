import { useEffect, useRef } from 'react'
import './matrix-rain.css'

const glyphs = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZカキクケコサシスセソタチツテトナニヌネノ'

export const MatrixRainCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return

    const fontSize = 14
    let width = 0
    let height = 0
    let drops: number[] = []
    let animationFrame = 0

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drops = Array.from({ length: Math.ceil(width / fontSize) }, () => Math.random() * -height / fontSize)
    }

    const draw = () => {
      context.fillStyle = 'rgba(1, 7, 3, 0.09)'
      context.fillRect(0, 0, width, height)
      context.font = `${fontSize}px "DM Mono", "Courier New", monospace`

      drops.forEach((drop, column) => {
        if (column % 3 !== 0) return
        const y = drop * fontSize
        context.globalAlpha = 0.45
        context.fillStyle = Math.random() > 0.985 ? '#00ffff' : '#008f11'
        context.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], column * fontSize, y)
        context.globalAlpha = 1
        drops[column] = y > height && Math.random() > 0.975 ? -Math.random() * 18 : drop + 0.46
      })

      animationFrame = window.requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animationFrame = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="matrix-rain-canvas" aria-hidden="true" />
}
