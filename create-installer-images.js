/**
 * NOTA: Questo script non è più necessario!
 * I file installerHeader.bmp e installerSidebar.bmp esistono già in public/
 * Le dipendenze jimp e sharp sono state rimosse dal package.json
 * 
 * Se devi rigenerare le immagini, reinstalla jimp con: npm install jimp --save-dev
 */

const { Jimp } = require('jimp');
const path = require('path');

async function createInstallerImages() {
  const publicDir = path.join(__dirname, 'public');
  
  // Header image: 150x57 pixels from diary.jpg
  console.log('Creating installer header (150x57) from diary.jpg...');
  const diaryPath = path.join(__dirname, 'src', 'assets', 'img', 'diary.jpg');
  const headerImage = await Jimp.read(diaryPath);
  headerImage.cover({ w: 150, h: 57 });
  await headerImage.write(path.join(publicDir, 'installerHeader.bmp'));
  console.log('✓ installerHeader.bmp created');

  // Sidebar image: 164x314 pixels from bg_forgotten.png
  console.log('Creating installer sidebar (164x314) from bg_forgotten.png...');
  const bgPath = path.join(__dirname, 'src', 'assets', 'img', 'bg_forgotten.png');
  const sidebarImage = await Jimp.read(bgPath);
  sidebarImage.cover({ w: 164, h: 314 });
  await sidebarImage.write(path.join(publicDir, 'installerSidebar.bmp'));
  console.log('✓ installerSidebar.bmp created');

  console.log('\nInstaller images created successfully in public/ folder!');
}

createInstallerImages().catch(err => {
  console.error('Error creating images:', err);
  process.exit(1);
});
