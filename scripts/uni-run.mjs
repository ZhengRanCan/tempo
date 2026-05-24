import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const uniBin = resolve(rootDir, 'node_modules/@dcloudio/vite-plugin-uni/bin/uni.js')
const child = spawn(process.execPath, [uniBin, ...process.argv.slice(2)], {
  cwd: rootDir,
  env: {
    ...process.env,
    UNI_INPUT_DIR: rootDir
  },
  stdio: 'inherit',
  shell: false
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
