import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const nodeModules = resolve(projectRoot, 'node_modules')
const commands = [
  [resolve(nodeModules, 'vite/bin/vite.js'), []],
  [resolve(nodeModules, 'tsx/dist/cli.mjs'), ['watch', 'server/index.ts']],
]

const children = commands.map(([entry, args]) => spawn(process.execPath, [entry, ...args], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
}))

let shuttingDown = false
const shutdown = (exitCode = 0) => {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM')
  }
  process.exitCode = exitCode
}

for (const child of children) {
  child.on('error', (error) => {
    console.error('Unable to start development process:', error.message)
    shutdown(1)
  })
  child.on('exit', (code, signal) => {
    if (!shuttingDown) shutdown(code ?? (signal ? 1 : 0))
  })
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
