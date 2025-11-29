const { rcedit } = require('rcedit');
const path = require('path');

const exePath = path.join(__dirname, 'release', 'win-unpacked', 'Phendelver.exe');
const iconPath = path.join(__dirname, 'public', 'icon.ico');

console.log('Applying icon to executable...');
console.log('Executable:', exePath);
console.log('Icon:', iconPath);

rcedit(exePath, {
  icon: iconPath,
  'version-string': {
    ProductName: 'Phendelver',
    FileDescription: 'Phendelver and Below - Interactive D&D Campaign Diary',
    CompanyName: 'dileo95',
    LegalCopyright: '© 2024 dileo95'
  }
}).then(() => {
  console.log('Icon applied successfully!');
}).catch((error) => {
  console.error('Error applying icon:', error);
  process.exit(1);
});
