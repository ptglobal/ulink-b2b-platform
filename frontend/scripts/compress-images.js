const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function getFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getFiles(fullPath, arrayOfFiles);
    } else {
      if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });
  return arrayOfFiles;
}

async function compressAll() {
  const publicDir = path.join(__dirname, '..', 'public');
  const files = getFiles(publicDir);
  console.log(`Found ${files.length} images in public directory.`);

  let totalOriginal = 0;
  let totalCompressed = 0;
  let count = 0;

  for (const filePath of files) {
    const origSize = fs.statSync(filePath).size;
    totalOriginal += origSize;

    const ext = path.extname(filePath).toLowerCase();

    try {
      // Read file into memory buffer to avoid file locks
      const inputBuffer = fs.readFileSync(filePath);
      let transformer = sharp(inputBuffer);

      if (ext === '.png') {
        transformer = transformer.png({ quality: 80, compressionLevel: 9, palette: true });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        transformer = transformer.jpeg({ quality: 80, mozjpeg: true });
      } else if (ext === '.webp') {
        transformer = transformer.webp({ quality: 80 });
      }

      const compressedBuffer = await transformer.toBuffer();
      if (compressedBuffer.length < origSize) {
        // Write via temp file to avoid file lock conflicts on Windows
        const tempPath = filePath + '.tmp';
        fs.writeFileSync(tempPath, compressedBuffer);
        fs.copyFileSync(tempPath, filePath);
        fs.unlinkSync(tempPath);

        const saved = origSize - compressedBuffer.length;
        totalCompressed += compressedBuffer.length;
        count++;
        console.log(
          `✓ Compressed ${path.relative(publicDir, filePath)}: ${(origSize / 1024).toFixed(1)}KB -> ${(compressedBuffer.length / 1024).toFixed(1)}KB (-${((saved / origSize) * 100).toFixed(1)}%)`
        );
      } else {
        totalCompressed += origSize;
        console.log(`- Skipped ${path.relative(publicDir, filePath)} (already optimal)`);
      }
    } catch (err) {
      console.error(`✕ Error compressing ${path.relative(publicDir, filePath)}:`, err.message);
      totalCompressed += origSize;
    }
  }

  const savedMB = ((totalOriginal - totalCompressed) / 1024 / 1024).toFixed(2);
  const percentage = (((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1);
  console.log('\n==========================================');
  console.log(`Finished compressing ${count}/${files.length} images.`);
  console.log(`Original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`New total size: ${(totalCompressed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total saved: ${savedMB} MB (${percentage}% reduction)`);
  console.log('==========================================\n');
}

compressAll();
