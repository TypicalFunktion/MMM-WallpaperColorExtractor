#!/usr/bin/env node

/**
 * Diagnostic script for MMM-WallpaperColorExtractor black screen issues
 * Run this on the remote machine to identify the problem
 */

const fs = require('fs');
const path = require('path');

console.log('=== MMM-WallpaperColorExtractor Diagnostic ===\n');

// Check if we're in the right directory
const currentDir = process.cwd();
console.log('Current directory:', currentDir);

// Check if main files exist
const files = [
    'MMM-WallpaperColorExtractor.js',
    'node_helper.js',
    'package.json',
    'MMM-WallpaperColorExtractor.css'
];

console.log('\n=== File Check ===');
files.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${file}: ${exists ? '✓' : '✗'}`);
    
    if (exists) {
        try {
            const stats = fs.statSync(file);
            console.log(`  Size: ${stats.size} bytes`);
            console.log(`  Modified: ${stats.mtime}`);
        } catch (error) {
            console.log(`  Error reading file: ${error.message}`);
        }
    }
});

// Check package.json
console.log('\n=== Package.json Analysis ===');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('Version:', packageJson.version);
    console.log('Dependencies:', Object.keys(packageJson.dependencies || {}));
    console.log('DevDependencies:', Object.keys(packageJson.devDependencies || {}));
} catch (error) {
    console.log('Error reading package.json:', error.message);
}

// Check if node_modules exists
console.log('\n=== Dependencies Check ===');
const nodeModulesExists = fs.existsSync('node_modules');
console.log('node_modules exists:', nodeModulesExists ? '✓' : '✗');

if (nodeModulesExists) {
    const requiredDeps = ['node-vibrant', 'color', 'lodash'];
    requiredDeps.forEach(dep => {
        const depPath = path.join('node_modules', dep);
        const exists = fs.existsSync(depPath);
        console.log(`${dep}: ${exists ? '✓' : '✗'}`);
    });
}

// Check MagicMirror config
console.log('\n=== MagicMirror Config Check ===');
const possibleConfigPaths = [
    '../config/config.js',
    '../../config/config.js',
    '/opt/magic_mirror/config/config.js',
    '/home/pi/MagicMirror/config/config.js'
];

possibleConfigPaths.forEach(configPath => {
    const exists = fs.existsSync(configPath);
    console.log(`${configPath}: ${exists ? '✓' : '✗'}`);
    
    if (exists) {
        try {
            const configContent = fs.readFileSync(configPath, 'utf8');
            const hasModule = configContent.includes('MMM-WallpaperColorExtractor');
            console.log(`  Contains module: ${hasModule ? '✓' : '✗'}`);
            
            if (hasModule) {
                // Look for potential syntax errors
                const lines = configContent.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes('MMM-WallpaperColorExtractor')) {
                        console.log(`  Line ${index + 1}: ${line.trim()}`);
                    }
                });
            }
        } catch (error) {
            console.log(`  Error reading config: ${error.message}`);
        }
    }
});

// Check system info
console.log('\n=== System Info ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Check for common issues
console.log('\n=== Common Issues Check ===');

// Check if sharp is available (optional dependency)
try {
    require('sharp');
    console.log('Sharp available: ✓');
} catch (error) {
    console.log('Sharp available: ✗ (optional)');
}

// Check if vibrant is available
try {
    require('node-vibrant');
    console.log('node-vibrant available: ✓');
} catch (error) {
    console.log('node-vibrant available: ✗');
    console.log('  Error:', error.message);
}

// Check if color is available
try {
    require('color');
    console.log('color available: ✓');
} catch (error) {
    console.log('color available: ✗');
    console.log('  Error:', error.message);
}

console.log('\n=== Diagnostic Complete ===');
console.log('\nNext steps:');
console.log('1. Check PM2 logs: pm2 logs MagicMirror --lines 100');
console.log('2. Check browser console for JavaScript errors');
console.log('3. Try the safe configuration in test-config.js');
console.log('4. Restart MagicMirror: pm2 restart MagicMirror'); 