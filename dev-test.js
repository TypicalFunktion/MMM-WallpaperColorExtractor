/**
 * Development test script for MMM-WallpaperColorExtractor
 * This script can be used to test the module's functionality in isolation
 */

// Mock MagicMirror environment
let registeredModule = null;
global.Module = {
    register: function(name, moduleConfig) {
        console.log(`Module registered: ${name}`);
        registeredModule = moduleConfig;
        return moduleConfig;
    }
};

global.Log = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`)
};

// Mock moment
global.moment = require('moment');

// Load the module
require('./MMM-WallpaperColorExtractor.js');

console.log('=== MMM-WallpaperColorExtractor Development Test ===\n');

// Test default configuration
console.log('Default Configuration:');
console.log(JSON.stringify(registeredModule.defaults, null, 2));

// Test configuration presets
const presets = {
    vibrant: {
        colorExtractionMethod: 'vibrant',
        minBrightness: 0.6,
        minSaturation: 0.5
    },
    subtle: {
        colorExtractionMethod: 'muted',
        minBrightness: 0.4,
        maxBrightness: 0.7,
        minSaturation: 0.3
    },
    accessible: {
        minContrastRatio: 7.0,
        colorExtractionMethod: 'vibrant'
    },
    performance: {
        updateInterval: 30000,
        samplingRatio: 0.05,
        maxCacheSize: 25
    }
};

console.log('\nConfiguration Presets:');
Object.keys(presets).forEach(preset => {
    console.log(`- ${preset}: ${JSON.stringify(presets[preset])}`);
});

// Test holiday colors
console.log('\nHoliday Colors:');
const holidayColors = registeredModule.defaults.holidayColors;
Object.keys(holidayColors).slice(0, 5).forEach(date => {
    console.log(`- ${date}: ${holidayColors[date]}`);
});

// Test CSS variables
console.log('\nCSS Variables:');
const cssVariables = registeredModule.defaults.cssVariables;
Object.keys(cssVariables).forEach(key => {
    console.log(`- ${key}: ${cssVariables[key]}`);
});

console.log('\n=== Development Test Complete ===');
console.log('\nTo use this module in MagicMirror:');
console.log('1. Add to your config.js:');
console.log('   {');
console.log('       module: "MMM-WallpaperColorExtractor",');
console.log('       config: {');
console.log('           preset: "vibrant"');
console.log('       }');
console.log('   }');
console.log('\n2. Restart MagicMirror');
console.log('3. Check the console for debug output'); 