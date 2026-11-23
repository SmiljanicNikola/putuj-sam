import { access, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const outputDir = resolve('dist')
for (const file of ['index.html', '.htaccess', '404.html', 'sitemap.xml']) {
  await access(resolve(outputDir, file))
}

const archive = resolve('deploy/putujsam-namecheap.zip')
await mkdir(resolve('deploy'), { recursive: true })
await rm(archive, { force: true })
const result = spawnSync('zip', ['-q', '-r', archive, '.', '-x', '_redirects'], {
  cwd: outputDir,
  stdio: 'inherit',
})
if (result.error) throw result.error
if (result.status !== 0) throw new Error(`Creating the ZIP failed: ${result.status}`)
console.log(`Ready to upload: ${archive}`)
console.log('Extract directly into the document root for putujsam.com; there is no dist wrapper.')
