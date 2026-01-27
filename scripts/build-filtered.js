#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Start the Next.js build process
const buildProcess = spawn('next', ['build'], {
  cwd: path.join(__dirname, '..'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

// Filter stdout
buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  // Filter out build manifest warnings while preserving other output
  const filtered = output
    .split('\n')
    .filter(line => {
      // Skip lines that contain build manifest warnings
      return !(line.includes('Could not find files for') && line.includes('build-manifest.json'));
    })
    .join('\n');
  
  if (filtered.trim()) {
    process.stdout.write(filtered);
  }
});

// Filter stderr
buildProcess.stderr.on('data', (data) => {
  const output = data.toString();
  // Filter out build manifest warnings while preserving other output
  const filtered = output
    .split('\n')
    .filter(line => {
      // Skip lines that contain build manifest warnings
      return !(line.includes('Could not find files for') && line.includes('build-manifest.json'));
    })
    .join('\n');
  
  if (filtered.trim()) {
    process.stderr.write(filtered);
  }
});

buildProcess.on('close', (code) => {
  process.exit(code);
});

buildProcess.on('error', (error) => {
  console.error('Build error:', error);
  process.exit(1);
});
