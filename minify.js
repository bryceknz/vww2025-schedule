const fs = require('fs');
const { minify } = require('terser');

async function minifyFile(inputFile, outputFile) {
  try {
    const code = fs.readFileSync(inputFile, 'utf8');
    const result = await minify(code, {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
    });

    fs.writeFileSync(outputFile, result.code);
    console.log(`Minified ${inputFile} -> ${outputFile}`);
  } catch (error) {
    console.error(`Error minifying ${inputFile}:`, error);
  }
}

async function minifyAll() {
  const files = ['script.js', 'categories.js', 'locations.js', 'events.js'];

  for (const file of files) {
    const minFile = file.replace('.js', '.min.js');
    await minifyFile(file, minFile);
  }

  console.log('All files minified!');
}

minifyAll();
