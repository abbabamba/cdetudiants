import sharp from 'sharp'
import { mkdirSync } from 'fs'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const input = 'public/images/logo.jpeg'

async function main() {
  mkdirSync('public/icons', { recursive: true })

  for (const size of sizes) {
    await sharp(input)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 27, g: 95, b: 173, alpha: 1 }
      })
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`)
    console.log(`✓ ${size}x${size}`)
  }

  console.log('Icônes générées dans public/icons/')
}

main().catch(console.error)
