import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function optimizeServicesImages() {
  console.log('Optimizing services images...');
  const servicesDir = path.join(PUBLIC_DIR, 'services images');
  if (fs.existsSync(servicesDir)) {
    const files = fs.readdirSync(servicesDir);
    for (const file of files) {
      if (file.endsWith('.webp') && !file.startsWith('temp_')) {
        const filePath = path.join(servicesDir, file);
        const tempPath = path.join(servicesDir, `temp_${file}`);
        await sharp(filePath)
          .resize(266, 266, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(tempPath);
        console.log(`Optimized ${file}`);
      }
    }
  }
}

optimizeServicesImages().catch(console.error);
