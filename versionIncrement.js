const fs = require('fs');
const path = './package.json';

fs.readFile(path, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const packageJson = JSON.parse(data);
  const versionParts = packageJson.version.split('.').map(Number);
  versionParts[2] += 1;
  if (versionParts[2] >= 10) {
    versionParts[2] = 0;
    versionParts[1] += 1;
  }
  if (versionParts[1] >= 10) {
    versionParts[1] = 0;
    versionParts[0] += 1;
  }
  packageJson.version = versionParts.join('.');

  fs.writeFile(path, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Version updated to ${packageJson.version}`);
  });
});
