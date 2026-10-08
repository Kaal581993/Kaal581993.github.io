import { useEffect, useState } from 'react'
import { Modal } from '../../components/Modal'
import './system-resources.css'

interface BrowserMetrics {
  cores: number | null
  deviceMemory: number | null
  heapUsed: number | null
  heapLimit: number | null
  uptimeSeconds: number
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number }
}

const readMetrics = (startedAt: number): BrowserMetrics => {
  const browser = navigator as NavigatorWithMemory
  const performanceWithMemory = performance as PerformanceWithMemory
  return {
    cores: navigator.hardwareConcurrency || null,
    deviceMemory: browser.deviceMemory ?? null,
    heapUsed: performanceWithMemory.memory?.usedJSHeapSize ?? null,
    heapLimit: performanceWithMemory.memory?.jsHeapSizeLimit ?? null,
    uptimeSeconds: Math.floor((performance.now() - startedAt) / 1000),
  }
}

const formatBytes = (bytes: number | null): string => {
  if (bytes === null) return 'not exposed by browser'
  const megabytes = bytes / (1024 * 1024)
  return `${megabytes >= 1024 ? (megabytes / 1024).toFixed(2) + ' GB' : megabytes.toFixed(0) + ' MB'}`
}

const formatUptime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

interface SystemResourcesProps {
  onClose: () => void
}

export const SystemResources = ({ onClose }: SystemResourcesProps) => {
  const [metrics, setMetrics] = useState(() => readMetrics(performance.now()))

  useEffect(() => {
    const startedAt = performance.now()
    const update = () => setMetrics(readMetrics(startedAt))
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [])

  const heapPercent = metrics.heapUsed !== null && metrics.heapLimit
    ? Math.min(100, Math.round(metrics.heapUsed / metrics.heapLimit * 100))
    : null

  return (
    <Modal title="System resources" eyebrow="BROWSER RUNTIME / LIVE" onClose={onClose}>
      <section className="resource-console" aria-label="Browser system resource metrics">
        <div className="resource-status"><span className="resource-live-dot" /> SESSION RUNTIME ACTIVE <span>{formatUptime(metrics.uptimeSeconds)}</span></div>
        <div className="resource-metrics">
          <article className="resource-metric"><span>LOGICAL CPU THREADS</span><strong>{metrics.cores ?? '—'}</strong><small>navigator.hardwareConcurrency</small></article>
          <article className="resource-metric"><span>DEVICE MEMORY</span><strong>{metrics.deviceMemory ? `~${metrics.deviceMemory} GB` : '—'}</strong><small>{metrics.deviceMemory ? 'browser estimate' : 'not exposed by browser'}</small></article>
          <article className="resource-metric resource-metric-wide"><span>JAVASCRIPT HEAP</span><strong>{formatBytes(metrics.heapUsed)} <i>/</i> {formatBytes(metrics.heapLimit)}</strong>
            {heapPercent !== null && <div className="resource-meter" role="meter" aria-label="JavaScript heap usage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={heapPercent}><span style={{ width: `${heapPercent}%` }} /></div>}
            <small>{heapPercent === null ? 'performance.memory is browser-specific and unavailable here' : `${heapPercent}% of exposed heap limit`}</small>
          </article>
        </div>
        <p className="resource-note">Browser sandbox metrics only. These values do not report total operating-system CPU or memory usage.</p>
      </section>
    </Modal>
  )
}
