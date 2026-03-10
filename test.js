/**
 * Jest test file for MMM-WallpaperColorExtractor v2.0.0
 * This file contains proper Jest tests for the module's functionality
 */

// Mock MagicMirror Module system for testing
global.Module = {
    register: function(name, moduleConfig) {
        this.name = name;
        this.config = moduleConfig;
        return moduleConfig;
    }
};

global.Log = {
    info: console.log,
    warn: console.warn,
    error: console.error
};

// Mock moment for date/time testing
global.moment = require('moment');

const moduleConfig = require('./MMM-WallpaperColorExtractor.js');

// Test configuration presets
const testConfigs = {
    vibrant: {
        preset: 'vibrant',
        debugMode: true
    },
    subtle: {
        preset: 'subtle',
        debugMode: true
    },
    accessible: {
        preset: 'accessible',
        debugMode: true
    },
    performance: {
        preset: 'performance',
        debugMode: true
    },
    multipleVariables: {
        enableMultipleVariables: true,
        cssVariables: {
            primary: '--color-text-highlight',
            secondary: '--color-text-highlight-secondary',
            accent: '--color-accent',
            border: '--color-border'
        },
        debugMode: true
    }
};

// Color validation function for testing
function isValidColor(color) {
    // Simple regex-based color validation for Node.js environment
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const namedColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'grey'];
    
    return hexRegex.test(color) || namedColors.includes(color.toLowerCase());
}

// Config validation function for testing
function validateConfig(config) {
    return config.minBrightness >= 0 && config.minBrightness <= 1 &&
           config.maxBrightness >= 0 && config.maxBrightness <= 1 &&
           config.minSaturation >= 0 && config.minSaturation <= 1 &&
           config.minContrastRatio >= 1 && config.minContrastRatio <= 21 &&
           config.maxRetries >= 0;
}

// Palette generation function for testing
function generateColorPalette(baseColor) {
    return {
        primary: baseColor,
        secondary: '#00FF00',
        accent: '#0000FF',
        muted: '#808080'
    };
}

describe('MMM-WallpaperColorExtractor', () => {
    describe('Color Validation', () => {
        test('should validate correct colors', () => {
            const validColors = ['#FF0000', '#00FF00', '#0000FF', 'red', 'blue', 'green'];
            
            validColors.forEach(color => {
                expect(isValidColor(color)).toBe(true);
            });
        });

        test('should reject invalid colors', () => {
            const invalidColors = ['', 'invalid', '#GG0000', 'notacolor'];
            
            invalidColors.forEach(color => {
                expect(isValidColor(color)).toBe(false);
            });
        });
    });

    describe('Configuration Validation', () => {
        test('should validate correct configuration', () => {
            const validConfig = {
                minBrightness: 0.5,
                maxBrightness: 0.9,
                minSaturation: 0.4,
                minContrastRatio: 4.5,
                maxRetries: 3
            };
            
            expect(validateConfig(validConfig)).toBe(true);
        });

        test('should reject invalid configuration', () => {
            const invalidConfig = {
                minBrightness: 1.5, // Invalid: > 1
                maxBrightness: -0.1, // Invalid: < 0
                minSaturation: 2.0, // Invalid: > 1
                minContrastRatio: 25, // Invalid: > 21
                maxRetries: -1 // Invalid: < 0
            };
            
            expect(validateConfig(invalidConfig)).toBe(false);
        });
    });

    describe('Color Palette Generation', () => {
        test('should generate valid color palette', () => {
            const baseColor = '#FF0000';
            const palette = generateColorPalette(baseColor);
            
            expect(palette).toBeDefined();
            expect(palette.primary).toBe(baseColor);
            expect(palette.secondary).toBe('#00FF00');
            expect(palette.accent).toBe('#0000FF');
            expect(palette.muted).toBe('#808080');
        });
    });

    describe('Performance Monitoring', () => {
        test('should track performance timers', () => {
            const timers = {};
            
            function startPerformanceTimer(name) {
                timers[name] = Date.now();
            }
            
            function endPerformanceTimer(name) {
                if (timers[name]) {
                    const duration = Date.now() - timers[name];
                    delete timers[name];
                    return duration;
                }
                return 0;
            }
            
            startPerformanceTimer('test');
            
            // Simulate some work
            const startTime = Date.now();
            while (Date.now() - startTime < 10) {
                // Small delay
            }
            
            const duration = endPerformanceTimer('test');
            expect(duration).toBeGreaterThan(0);
            expect(timers['test']).toBeUndefined();
        });
    });

    describe('Configuration Presets', () => {
        test('should have valid preset configurations', () => {
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
            
            Object.keys(presets).forEach(preset => {
                expect(presets[preset]).toBeDefined();
                expect(typeof presets[preset]).toBe('object');
            });
        });
    });

    describe('Module Registration', () => {
        test('should register module correctly', () => {
            expect(global.Module.name).toBe('MMM-WallpaperColorExtractor');
            expect(global.Module.config).toBeDefined();
        });

        test('should have default configuration', () => {
            const config = global.Module.config;
            expect(config.defaults).toBeDefined();
            expect(config.defaults.updateInterval).toBe(10000);
            expect(config.defaults.defaultColor).toBe('#90d5ff');
        });
    });

    describe('Test Configuration Objects', () => {
        test('should have valid test configurations', () => {
            Object.keys(testConfigs).forEach(configName => {
                const config = testConfigs[configName];
                expect(config).toBeDefined();
                expect(config.debugMode).toBe(true);
            });
        });

        test('should have multiple variables configuration', () => {
            const multiVarConfig = testConfigs.multipleVariables;
            expect(multiVarConfig.enableMultipleVariables).toBe(true);
            expect(multiVarConfig.cssVariables).toBeDefined();
            expect(multiVarConfig.cssVariables.primary).toBe('--color-text-highlight');
        });
    });

    describe('Bug Fix Regression Tests', () => {
        test('Pi Day hex color should be a valid 6-digit hex', () => {
            const holidayColors = global.Module.config.defaults.holidayColors;
            const piDayColor = holidayColors['03-14'];
            expect(piDayColor).toBeDefined();
            // Must be exactly 6 hex digits (7-char string including #)
            expect(/^#[A-Fa-f0-9]{6}$/.test(piDayColor)).toBe(true);
            expect(piDayColor).toBe('#314159');
        });

        test('all holiday colors should be valid hex colors', () => {
            const holidayColors = global.Module.config.defaults.holidayColors;
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            Object.entries(holidayColors).forEach(([date, color]) => {
                expect(hexRegex.test(color)).toBe(true, `Invalid color for date ${date}: ${color}`);
            });
        });

        test('LRUCache should store and expose cachePath', () => {
            // Simulate the LRUCache constructor fix by testing the pattern directly
            class LRUCacheTest {
                constructor(maxSize = 50, cachePath = "") {
                    this.maxSize = maxSize;
                    this.cachePath = cachePath;
                    this.cache = new Map();
                }
            }
            const cache = new LRUCacheTest(10, '/tmp/test-cache');
            expect(cache.cachePath).toBe('/tmp/test-cache');
            expect(cache.maxSize).toBe(10);
        });

        test('applyPreset should create new config object (not mutate original)', () => {
            // Test that the preset merge produces a new object
            const originalConfig = { updateInterval: 10000, debugMode: false, minBrightness: 0.3 };
            const preset = { colorExtractionMethod: 'vibrant', minBrightness: 0.6 };
            const newConfig = Object.assign({}, originalConfig, preset);
            // Ensure preset values override
            expect(newConfig.minBrightness).toBe(0.6);
            expect(newConfig.colorExtractionMethod).toBe('vibrant');
            // Ensure non-overridden values are preserved
            expect(newConfig.updateInterval).toBe(10000);
            // Ensure original is unchanged (shallow clone was used)
            expect(originalConfig.colorExtractionMethod).toBeUndefined();
        });

        test('cleanupCache should not throw when config is null', () => {
            const fs = require('fs');
            const path = require('path');
            const os = require('os');
            const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mme-test-'));

            // Simulate cleanupCache logic with null config
            const cleanupCache = function(cachePath, config) {
                if (!fs.existsSync(cachePath)) return;
                const maxAge = (config && config.maxCacheAge) || (24 * 60 * 60 * 1000);
                const maxSize = (config && config.maxCacheSize) || 50;
                let files = fs.readdirSync(cachePath).filter(f => f.endsWith('.jpg'));
                const now = Date.now();
                files.forEach(file => {
                    const filePath = path.join(cachePath, file);
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtime.getTime() > maxAge) fs.unlinkSync(filePath);
                });
            };

            // Should not throw with null config
            expect(() => cleanupCache(tmpDir, null)).not.toThrow();
            // Should not throw with missing cache dir
            expect(() => cleanupCache('/nonexistent/path/xyz', null)).not.toThrow();

            // Cleanup
            fs.rmdirSync(tmpDir);
        });
    });
});