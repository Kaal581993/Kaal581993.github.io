import { useEffect, useRef, useState } from 'react'
import './boot-screen.css'

interface BootScreenProps {
  onComplete: () => void
}

const bootMessages = [
  '[    0.000000] Linux version 6.8.0-matrix (viral@prajapati)',
  '[    0.013482] Command line: BOOT_IMAGE=/vmlinuz root=/dev/mapper/system ro quiet',
  '[    0.047102] x86/fpu: Supporting XSAVE feature 0x001: x87 floating point registers',
  '[    0.083214] BIOS-provided physical RAM map detected',
  '[    0.124607] Memory: 16384M available for kernel and userspace',
  '[    0.167841] ACPI: Early table checksum verification disabled',
  '[    0.202537] CPU0: Intel Core Processor initialized',
  '[    0.238019] smpboot: Allowing 8 CPUs, 0 hotplug CPUs',
  '[    0.274428] Kernel command line parsed successfully',
  '[    0.311806] clocksource: tsc-early installed',
  '[    0.348173] security: lsm=capability,landlock,lockdown,yama',
  '[    0.384951] NET: Registered PF_NETLINK protocol family',
  '[    0.421116] PCI: Using configuration type 1 for base access',
  '[    0.457280] SCSI subsystem initialized',
  '[    0.493627] usbcore: registered new interface driver hub',
  '[    0.529984] Loading initial ramdisk ...',
  '[    0.566213] initramfs: unpacking archive; compression=gzip',
  '[    0.602379] initramfs: unpacked successfully',
  '[    0.638725] device-mapper: uevent: version 1.0.3',
  '[    0.675106] Begin: Waiting for root file system ...',
  '[    0.711482] /dev/mapper/system: journal recovery complete',
  '[    0.747838] EXT4-fs: mounted filesystem with ordered data mode',
  '[    0.784206] systemd[1]: system manager initialization started',
  '[    0.820579] systemd[1]: Detected architecture x86-64',
  '[    0.856943] systemd[1]: Set hostname to viral-workstation',
  '[    0.893306] systemd[1]: Created slice system.slice',
  '[    0.929668] systemd[1]: Listening on Journal Socket',
  '[    0.966031] systemd[1]: Mounting /proc, /sys, /dev and /run',
  '[    1.002394] systemd[1]: Reached target Local File Systems',
  '[    1.038757] systemd[1]: Starting Network Manager ...',
  '[    1.075120] NetworkManager: secure interface online',
  '[    1.111483] systemd[1]: Started User Login Management',
  '[    1.147846] systemd[1]: Started OpenSSH Daemon',
  '[    1.184209] systemd[1]: Reached target Network',
  '[    1.220572] systemd[1]: Starting portfolio-web.service ...',
  '[    1.256935] portfolio-web.service: loading application modules',
  '[    1.293298] portfolio-web.service: connecting secure shell',
  '[    1.329661] portfolio-web.service: assets and profile loaded',
  '[    1.366024] portfolio-web.service: active (running)',
  '[    1.402387] systemd[1]: Reached target Multi-User System',
]

const bootDurationMs = 30_000
const bootLineIntervalMs = 750

export const BootScreen = ({ onComplete }: BootScreenProps) => {
  const [visibleLines, setVisibleLines] = useState(1)
  const [isComplete, setIsComplete] = useState(false)
  const linesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleLines((current) => Math.min(current + 1, bootMessages.length))
    }, bootLineIntervalMs)
    const completion = window.setTimeout(() => {
      setVisibleLines(bootMessages.length)
      setIsComplete(true)
    }, bootDurationMs)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(completion)
    }
  }, [])

  useEffect(() => {
    const lines = linesRef.current
    if (lines) lines.scrollTop = lines.scrollHeight
  }, [visibleLines])

  useEffect(() => {
    if (!isComplete) return
    const timeout = window.setTimeout(onComplete, 520)
    return () => window.clearTimeout(timeout)
  }, [isComplete, onComplete])

  return (
    <section className={`boot-screen${isComplete ? ' boot-screen-ready' : ''}`} aria-label="Linux system startup" aria-live="polite">
      <div className="boot-console">
        <div className="boot-brand"><span className="boot-mark">[ VP ]</span><span>VIRAL PRAJAPATI / SYSTEM STARTUP</span></div>
        <div className="boot-lines" ref={linesRef}>
          {bootMessages.slice(0, visibleLines).map((message) => <p key={message}>{message}</p>)}
          {!isComplete && <p className="boot-current"><span className="boot-spinner" /> initramfs: waiting for root device<span className="boot-cursor">_</span></p>}
          {isComplete && <p className="boot-complete">[  OK  ] Reached target: matrix portfolio session</p>}
        </div>
        <div className="boot-progress-track" role="progressbar" aria-label="System startup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={isComplete ? 100 : Math.min(99, Math.round((visibleLines / bootMessages.length) * 100))}>
          <span style={{ width: `${isComplete ? 100 : Math.min(99, Math.round((visibleLines / bootMessages.length) * 100))}%` }} />
        </div>
        <footer className="boot-footer"><span>GNU/LINUX INIT SEQUENCE</span><button type="button" onClick={onComplete}>SKIP BOOT <span aria-hidden="true">↗</span></button></footer>
      </div>
    </section>
  )
}
