import sharp from 'sharp'
import { readdir, stat, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const directory = resolve('public/images')
let before = 0,
  after = 0
for (const file of await readdir(directory)) {
  if (!file.endsWith('.jpg')) continue
  const path = resolve(directory, file)
  before += (await stat(path)).size
  const buffer = await sharp(path)
    .rotate()
    .resize({ width: 1400, withoutEnlargement: true })
    .jpeg({ quality: 79, mozjpeg: true })
    .toBuffer()
  await writeFile(path, buffer)
  after += buffer.length
  const thumbnail = await sharp(buffer)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer()
  await writeFile(resolve(directory, file.replace('.jpg', '-600.webp')), thumbnail)
  const full = await sharp(buffer).webp({ quality: 82 }).toBuffer()
  await writeFile(resolve(directory, file.replace('.jpg', '.webp')), full)
}
console.log(
  `JPEG assets: ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB. Responsive WebP variants created.`,
)
