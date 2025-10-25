import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateSummaryImage(totalCountries, topCountries, lastRefreshedAt) {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Country Data Summary', 20, 40);

  // Total countries
  ctx.font = '18px Arial';
  ctx.fillText(`Total Countries: ${totalCountries}`, 20, 80);

  // Last refreshed
  ctx.fillText(`Last Refreshed: ${new Date(lastRefreshedAt).toLocaleString()}`, 20, 110);

  // Top 5 countries
  ctx.fillText('Top 5 Countries by Estimated GDP:', 20, 150);
  ctx.font = '16px Arial';
  topCountries.forEach((country, index) => {
    const y = 180 + index * 25;
    ctx.fillText(`${index + 1}. ${country.name}: $${country.estimated_gdp.toLocaleString()}`, 40, y);
  });

  // Ensure cache directory exists
  const cacheDir = path.join(__dirname, '../../cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Save image
  const buffer = canvas.toBuffer('image/png');
  const imagePath = path.join(cacheDir, 'summary.png');
  fs.writeFileSync(imagePath, buffer);

  return imagePath;
}
