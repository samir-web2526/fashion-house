const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const standalonePath = path.join(__dirname, '.next', 'standalone');
  if (fs.existsSync(standalonePath)) {
    console.log('Copying static assets for standalone build...');
    copyDir(path.join(__dirname, 'public'), path.join(standalonePath, 'public'));
    copyDir(path.join(__dirname, '.next', 'static'), path.join(standalonePath, '.next', 'static'));
    console.log('Static assets copied successfully!');
  } else {
    console.log('Skipping static copy: standalone build output not active.');
  }
} catch (err) {
  console.error('Error copying static assets:', err);
}
