const fs = require('fs');
const path = require('path');

// Fix the paths in index.html for GitHub Pages
const indexPath = path.join(__dirname, 'dist', 'index.html');
const nojekyllPath = path.join(__dirname, 'dist', '.nojekyll');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Replace absolute paths with relative paths
  content = content.replace(/src="\//g, 'src="./');
  content = content.replace(/href="\//g, 'href="./');
  
  // Fix the _expo path specifically
  content = content.replace(/src="\.\/_expo/g, 'src="./_expo');
  
  fs.writeFileSync(indexPath, content);
  console.log('Fixed asset paths in index.html');
} else {
  console.log('index.html not found');
}

// Create .nojekyll file to prevent GitHub from ignoring _expo directory
fs.writeFileSync(nojekyllPath, '');
console.log('Created .nojekyll file');
