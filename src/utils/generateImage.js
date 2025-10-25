import PImage from 'pureimage'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function generateSummaryImage(totalCountries, topCountries, lastRefreshedAt) {
  const width = 800
  const height = 600
  const fnt = PImage.registerFont(
    "assets/ARIAL.TTF",
    "Arial",
  );
  fnt.loadSync();
  const img = PImage.make(width, height)
  const ctx = img.getContext('2d')


  // Background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = '24pt Arial'
  ctx.fillText('Country Data Summary', 20, 40)

  // Total countries & date
  ctx.font = '18pt Arial'
  ctx.fillText(`Total Countries: ${totalCountries}`, 20, 80)
  ctx.fillText(`Last Refreshed: ${new Date(lastRefreshedAt).toLocaleString()}`, 20, 110)

  // Top 5 countries
  ctx.fillText('Top 5 Countries by Estimated GDP:', 20, 150)
  ctx.font = '16pt Arial'
  topCountries.forEach((country, index) => {
    const y = 180 + index * 25
    ctx.fillText(`${index + 1}. ${country.name}: $${country.estimated_gdp.toLocaleString()}`, 40, y)
  })

  // Ensure cache folder exists
  const cacheDir = path.join(__dirname, '../../cache')
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true })

  // Save image correctly
  const imagePath = path.join(cacheDir, 'summary.png')
  const out = fs.createWriteStream(imagePath)

  // Await encoding to finish properly
  await new Promise((resolve, reject) => {
    PImage.encodePNGToStream(img, out)
      .then(() => {
        console.log(`✅ Image saved to ${imagePath}`)
        resolve()
      })
      .catch(err => reject(err))
  })

  return imagePath
}
