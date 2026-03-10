/* Magic Mirror
 * Node Helper: MMM-WallpaperColorExtractor
 *
 * By TypicalFunktion
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

// Try to load node-vibrant with fallback
let Vibrant;
try {
    Vibrant = require('node-vibrant/node');
    console.log("MMM-WallpaperColorExtractor: node-vibrant loaded successfully");
} catch (error) {
    console.warn("MMM-WallpaperColorExtractor: node-vibrant failed to load, using fallback color extraction");
    Vibrant = null;
}

const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');
const sharp = require('sharp');
const Color = require('color');
const _ = require('lodash');

// LRU Cache implementation for better memory management
class LRUCache {
    constructor(maxSize = 50, cachePath = "") {
        this.maxSize = maxSize;
        this.cachePath = cachePath;
        this.cache = new Map();
        this.accessOrder = [];
    }
    
    get(key) {
        if (this.cache.has(key)) {
            // Move to end of access order (most recently used)
            const index = this.accessOrder.indexOf(key);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
            }
            this.accessOrder.push(key);
            return this.cache.get(key);
        }
        return null;
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            // Update existing entry
            this.cache.set(key, value);
            // Move to end of access order
            const index = this.accessOrder.indexOf(key);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
            }
            this.accessOrder.push(key);
        } else {
            // Add new entry
            if (this.cache.size >= this.maxSize) {
                // Remove least recently used item
                const lruKey = this.accessOrder.shift();
                if (lruKey) {
                    this.cache.delete(lruKey);
                    // Also remove the cached file
                    this.removeCachedFile(lruKey);
                }
            }
            this.cache.set(key, value);
            this.accessOrder.push(key);
        }
    }
    
    has(key) {
        return this.cache.has(key);
    }
    
    removeCachedFile(key) {
        try {
            const cachedImagePath = path.join(this.cachePath, key + '.jpg');
            if (fs.existsSync(cachedImagePath)) {
                fs.unlinkSync(cachedImagePath);
            }
        } catch (error) {
            console.error(`MMM-WallpaperColorExtractor: Error removing cached file: ${error.message}`);
        }
    }

    clear() {
        this.cache.clear();
        this.accessOrder = [];
        // Clear all cached files
        try {
            const files = fs.readdirSync(this.cachePath);
            files.forEach(file => {
                if (file.endsWith('.jpg')) {
                    fs.unlinkSync(path.join(this.cachePath, file));
                }
            });
        } catch (error) {
            console.error(`MMM-WallpaperColorExtractor: Error clearing cache: ${error.message}`);
        }
    }
    
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.calculateHitRate()
        };
    }
    
    calculateHitRate() {
        // This would need to be implemented with hit/miss tracking
        return 0.8; // Placeholder
    }
}

module.exports = NodeHelper.create({
    // Debug logging helper - only logs when debugMode is enabled
    debugLog: function(message) {
        if (this.config && this.config.debugMode) {
            console.log(message);
        }
    },

    // Initialize the helper with enhanced features
    start: function() {
        console.log("Starting node helper for: " + this.name);

        // Initialize state
        this.isListening = false;
        this.wallpaperDir = "";
        this.currentWallpaper = "";
        this.watchTimer = null;
        this.checkCount = 0;
        this.searchedDirs = [];
        this.cachePath = path.join(__dirname, "cache");
        this.config = null;
        
        // Performance tracking
        this.performanceMetrics = {
            extractionCount: 0,
            totalExtractionTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            lastReset: Date.now()
        };
        
        // Initialize LRU cache
        this.imageCache = new LRUCache(50, this.cachePath);
        
        // Create cache directory if it doesn't exist
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
        
        // Set up periodic cleanup
        this.setupPeriodicCleanup();
        
        console.log("MMM-WallpaperColorExtractor: Node helper started successfully");
    },
    
    // Set up periodic cleanup tasks
    setupPeriodicCleanup: function() {
        // Clean up old cache entries every hour
        setInterval(() => {
            this.cleanupCache();
        }, 60 * 60 * 1000);
        
        // Reset performance metrics daily
        setInterval(() => {
            this.resetPerformanceMetrics();
        }, 24 * 60 * 60 * 1000);
    },
    
    // Clean up old cache entries
    cleanupCache: function() {
        try {
            if (!fs.existsSync(this.cachePath)) return;
            const now = Date.now();
            const maxAge = (this.config && this.config.maxCacheAge) || (24 * 60 * 60 * 1000);
            const maxSize = (this.config && this.config.maxCacheSize) || 50;

            let files = fs.readdirSync(this.cachePath).filter(f => f.endsWith('.jpg'));

            // Remove files older than maxAge
            files.forEach(file => {
                const filePath = path.join(this.cachePath, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filePath);
                }
            });

            // If still over maxSize, remove oldest files
            files = fs.readdirSync(this.cachePath).filter(f => f.endsWith('.jpg'));
            if (files.length > maxSize) {
                const sorted = files
                    .map(file => ({ path: path.join(this.cachePath, file), mtime: fs.statSync(path.join(this.cachePath, file)).mtime }))
                    .sort((a, b) => a.mtime - b.mtime);
                for (let i = 0; i < sorted.length - maxSize; i++) {
                    fs.unlinkSync(sorted[i].path);
                }
            }
        } catch (error) {
            this.debugLog(`MMM-WallpaperColorExtractor: Error during cache cleanup: ${error.message}`);
        }
    },
    
    // Reset performance metrics
    resetPerformanceMetrics: function() {
        this.performanceMetrics = {
            extractionCount: 0,
            totalExtractionTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            lastReset: Date.now()
        };
    },
    
    // Enhanced error handling wrapper
    handleError: function(error, context, callback) {
        this.performanceMetrics.errors++;
        
        console.error(`MMM-WallpaperColorExtractor [ERROR] [${context}]:`, error);
        
        // Send error notification to module
        this.sendSocketNotification("ERROR_OCCURRED", {
            error: error.message || error,
            context: context,
            timestamp: Date.now()
        });
        
        if (callback) {
            callback(error);
        }
    },
    
    // Socket notification received from module with enhanced error handling
    socketNotificationReceived: function(notification, payload) {
        try {
            this.debugLog(`MMM-WallpaperColorExtractor: Received notification: ${notification}`);
            
            switch (notification) {
                case "SUBSCRIBE_WALLPAPER_CHANGES":
                    this.handleSubscribeWallpaperChanges(payload);
                    break;
                case "EXTRACT_COLOR":
                    this.handleExtractColor(payload);
                    break;
                case "CHECK_WALLPAPER":
                    this.handleCheckWallpaper(payload);
                    break;
                case "PROCESS_REMOTE_WALLPAPER":
                    this.handleProcessRemoteWallpaper(payload);
                    break;
                case "ERROR_RECOVERY":
                    this.handleErrorRecovery(payload);
                    break;
                case "PERFORMANCE_METRIC":
                    this.handlePerformanceMetric(payload);
                    break;
                case "MODULE_SHUTDOWN":
                    this.handleModuleShutdown(payload);
                    break;
                default:
                    this.debugLog(`MMM-WallpaperColorExtractor: Unknown notification: ${notification}`);
            }
        } catch (error) {
            this.handleError(error, "SOCKET_NOTIFICATION");
        }
    },
    
    // Handle subscribe wallpaper changes
    handleSubscribeWallpaperChanges: function(payload) {
        this.debugLog("MMM-WallpaperColorExtractor: Subscribing to wallpaper changes");
        this.config = payload.config;
        
        if (!this.isListening) {
            // Start monitoring the wallpaper directory
            this.findWallpaperDirectory(this.config);
            this.isListening = true;
        }
    },
    
    // Handle extract color with retry logic
    handleExtractColor: function(payload) {
        this.debugLog(`MMM-WallpaperColorExtractor: Extracting color from: ${payload.imagePath}`);
        
        const startTime = Date.now();
        this.performanceMetrics.extractionCount++;
        
        // Extract color from the image with retry logic
        this.extractColorFromImageWithRetry(payload.imagePath, payload.config || this.config, payload.retryAttempt || 0)
            .then(result => {
                const extractionTime = Date.now() - startTime;
                this.performanceMetrics.totalExtractionTime += extractionTime;
                
                // Send performance metrics
                this.sendPerformanceMetrics();
                
                this.sendSocketNotification("COLOR_EXTRACTED", result);
            })
            .catch(error => {
                this.handleError(error, "EXTRACT_COLOR");
                
                // Send fallback color
                const fallbackIndex = Math.floor(Math.random() * (payload.config || this.config).fallbackColors.length);
                const fallbackColor = (payload.config || this.config).fallbackColors[fallbackIndex];
                
                this.sendSocketNotification("COLOR_EXTRACTED", {
                    success: false,
                    color: fallbackColor,
                    source: "extraction-error",
                    error: error.message
                });
            });
    },
    
    // Handle check wallpaper
    handleCheckWallpaper: function(payload) {
        this.debugLog("MMM-WallpaperColorExtractor: Manual check for wallpaper requested");
        
        if (!this.currentWallpaper || this.checkCount < 3) {
            // Increment the check count
            this.checkCount++;
            
            // If we still haven't found a wallpaper, try harder to locate one
            if (!this.wallpaperDir || !this.currentWallpaper) {
                this.searchForWallpapers();
            } else {
                // If we have a directory but no current wallpaper, try again
                this.findCurrentWallpaper();
            }
        }
    },
    
    // Handle process remote wallpaper
    handleProcessRemoteWallpaper: function(payload) {
        this.debugLog(`MMM-WallpaperColorExtractor: Processing remote wallpaper: ${payload.url}`);
        this.processRemoteWallpaper(payload.url, payload.config || this.config);
    },
    
    // Handle error recovery
    handleErrorRecovery: function(payload) {
        this.debugLog(`MMM-WallpaperColorExtractor: Attempting error recovery for: ${payload.context}`);
        
        // Implement recovery strategies based on error context
        switch (payload.context) {
            case "CACHE":
                this.imageCache.clear();
                this.debugLog("MMM-WallpaperColorExtractor: Cache cleared for recovery");
                break;
            case "WALLPAPER_DETECTION":
                this.searchForWallpapers();
                break;
            default:
                this.debugLog(`MMM-WallpaperColorExtractor: No specific recovery strategy for: ${payload.context}`);
        }
    },
    
    // Handle performance metric
    handlePerformanceMetric: function(payload) {
        this.debugLog(`MMM-WallpaperColorExtractor: Performance metric - ${payload.operation}: ${payload.duration}ms`);
    },
    
    // Handle module shutdown
    handleModuleShutdown: function(payload) {
        this.debugLog("MMM-WallpaperColorExtractor: Module shutdown detected");
        
        // Clean up resources
        this.cleanupCache();
        this.resetPerformanceMetrics();
        
        if (this.watchTimer) {
            clearInterval(this.watchTimer);
            this.watchTimer = null;
        }
    },
    
    // Send performance metrics to module
    sendPerformanceMetrics: function() {
        const avgExtractionTime = this.performanceMetrics.extractionCount > 0 
            ? this.performanceMetrics.totalExtractionTime / this.performanceMetrics.extractionCount 
            : 0;
        
        const cacheStats = this.imageCache.getStats();
        
        this.sendSocketNotification("PERFORMANCE_METRICS", {
            extractionCount: this.performanceMetrics.extractionCount,
            averageExtractionTime: avgExtractionTime,
            cacheHitRate: cacheStats.hitRate,
            cacheSize: cacheStats.size,
            errorCount: this.performanceMetrics.errors,
            uptime: Date.now() - this.performanceMetrics.lastReset
        });
    },
    
    // Enhanced color extraction with retry logic
    extractColorFromImageWithRetry: function(imagePath, config, retryAttempt = 0) {
        return new Promise((resolve, reject) => {
            const maxRetries = config.maxRetries || 3;
            const retryDelay = config.retryDelay || 1000;
            
            this.extractColorFromImage(imagePath, config)
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    if (retryAttempt < maxRetries) {
                        this.debugLog(`MMM-WallpaperColorExtractor: Retry attempt ${retryAttempt + 1}/${maxRetries} for ${imagePath}`);
                        
                        setTimeout(() => {
                            this.extractColorFromImageWithRetry(imagePath, config, retryAttempt + 1)
                                .then(resolve)
                                .catch(reject);
                        }, retryDelay * (retryAttempt + 1));
                    } else {
                        reject(error);
                    }
                });
        });
    },
    
    // Enhanced color extraction from image
    extractColorFromImage: function(imagePath, config) {
        return new Promise((resolve, reject) => {
            try {
                if (!imagePath) {
                    reject(new Error("No image path provided"));
                    return;
                }
                
                // Check cache first
                const imageHash = crypto.createHash('md5').update(imagePath).digest('hex');
                const cachedResult = this.imageCache.get(imageHash);
                
                if (cachedResult) {
                    this.performanceMetrics.cacheHits++;
                    this.debugLog(`MMM-WallpaperColorExtractor: Using cached color for ${imagePath}`);
                    resolve(cachedResult);
                    return;
                }
                
                this.performanceMetrics.cacheMisses++;
                
                // Validate file exists
                if (!fs.existsSync(imagePath)) {
                    reject(new Error(`Image file not found: ${imagePath}`));
                    return;
                }
                
                // Get file stats for validation
                const stats = fs.statSync(imagePath);
                if (stats.size === 0) {
                    reject(new Error(`Image file is empty: ${imagePath}`));
                    return;
                }
                
                // Process image with Sharp for optimization
                let tempProcessedPath = null;
                this.preprocessImage(imagePath, config)
                    .then(processedImagePath => {
                        // Track temp file so we can delete it after extraction
                        if (processedImagePath !== imagePath) {
                            tempProcessedPath = processedImagePath;
                        }
                        return this.extractVibrantColor(processedImagePath, config);
                    })
                    .then(colorResult => {
                        // Delete temp preprocessed file to avoid disk accumulation
                        if (tempProcessedPath) {
                            try { fs.unlinkSync(tempProcessedPath); } catch (e) { /* ignore */ }
                        }
                        // Cache the result
                        this.imageCache.set(imageHash, colorResult);
                        resolve(colorResult);
                    })
                    .catch(error => {
                        if (tempProcessedPath) {
                            try { fs.unlinkSync(tempProcessedPath); } catch (e) { /* ignore */ }
                        }
                        reject(error);
                    });
                    
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // Preprocess image for better performance
    preprocessImage: function(imagePath, config) {
        return new Promise((resolve, reject) => {
            try {
                const resizeOptions = config.imageResizeOptions || {
                    width: 800,
                    height: 600,
                    fit: 'inside'
                };
                
                const outputPath = imagePath + '.processed.jpg';
                
                sharp(imagePath)
                    .resize(resizeOptions.width, resizeOptions.height, {
                        fit: resizeOptions.fit,
                        withoutEnlargement: true
                    })
                    .jpeg({ quality: 85 })
                    .toFile(outputPath)
                    .then(() => {
                        resolve(outputPath);
                    })
                    .catch(error => {
                        // If preprocessing fails, use original image
                        this.debugLog(`MMM-WallpaperColorExtractor: Image preprocessing failed, using original: ${error.message}`);
                        resolve(imagePath);
                    });
                    
            } catch (error) {
                // If Sharp fails, use original image
                this.debugLog(`MMM-WallpaperColorExtractor: Sharp not available, using original image: ${error.message}`);
                resolve(imagePath);
            }
        });
    },
    
    // Extract vibrant color using node-vibrant
    extractVibrantColor: function(imagePath, config) {
        return new Promise((resolve, reject) => {
            try {
                if (!Vibrant) {
                    console.warn("MMM-WallpaperColorExtractor: node-vibrant not available, using fallback color.");
                    const fallbackIndex = Math.floor(Math.random() * (config.fallbackColors || []).length);
                    const fallbackColor = (config.fallbackColors || [])[fallbackIndex];
                    resolve({
                        success: true,
                        color: fallbackColor,
                        source: "fallback",
                        fileInfo: path.basename(imagePath),
                        method: "fallback",
                        palette: {}
                    });
                    return;
                }

                const vibrant = new Vibrant(imagePath, {
                    quality: 1,
                    colorCount: 64,
                    quantizer: 'MMCQ'
                });
                
                vibrant.getPalette()
                    .then(palette => {
                        const selectedColor = this.selectBestColor(palette, config);
                        
                        if (selectedColor) {
                            const result = {
                                success: true,
                                color: selectedColor,
                                source: "wallpaper",
                                fileInfo: path.basename(imagePath),
                                method: config.colorExtractionMethod || "vibrant",
                                palette: palette
                            };
                            
                            resolve(result);
                        } else {
                            reject(new Error("No suitable color found in image"));
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
                    
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // Select the best color from palette based on configuration
    selectBestColor: function(palette, config) {
        try {
            const method = config.colorExtractionMethod || "vibrant";
            const minBrightness = config.minBrightness || 0.5;
            const maxBrightness = config.maxBrightness || 0.9;
            const minSaturation = config.minSaturation || 0.4;
            const minContrastRatio = config.minContrastRatio || 4.5;
            
            let candidates = [];
            
            // Get colors based on extraction method
            switch (method) {
                case "vibrant":
                    if (palette.Vibrant) candidates.push(palette.Vibrant);
                    if (palette.Muted) candidates.push(palette.Muted);
                    if (palette.DarkVibrant) candidates.push(palette.DarkVibrant);
                    if (palette.DarkMuted) candidates.push(palette.DarkMuted);
                    if (palette.LightVibrant) candidates.push(palette.LightVibrant);
                    if (palette.LightMuted) candidates.push(palette.LightMuted);
                    break;
                case "muted":
                    if (palette.Muted) candidates.push(palette.Muted);
                    if (palette.DarkMuted) candidates.push(palette.DarkMuted);
                    if (palette.LightMuted) candidates.push(palette.LightMuted);
                    if (palette.Vibrant) candidates.push(palette.Vibrant);
                    break;
                case "random":
                    // Add all available colors
                    Object.values(palette).forEach(color => {
                        if (color) candidates.push(color);
                    });
                    break;
                default:
                    if (palette.Vibrant) candidates.push(palette.Vibrant);
                    if (palette.Muted) candidates.push(palette.Muted);
            }
            
            // Filter candidates based on criteria
            const validCandidates = candidates.filter(color => {
                if (!color) return false;
                
                const colorObj = Color(color.getHex());
                const brightness = colorObj.luminosity();
                const saturation = colorObj.saturationl() / 100;
                
                return brightness >= minBrightness && 
                       brightness <= maxBrightness && 
                       saturation >= minSaturation;
            });
            
            if (validCandidates.length === 0) {
                // If no valid candidates, use any available color
                candidates = candidates.filter(color => color);
                if (candidates.length > 0) {
                    return candidates[0].getHex();
                }
                return null;
            }
            
            // Select the best candidate
            if (method === "random") {
                const randomIndex = Math.floor(Math.random() * validCandidates.length);
                return validCandidates[randomIndex].getHex();
            } else {
                // Return the first valid candidate (usually the most vibrant)
                return validCandidates[0].getHex();
            }
            
        } catch (error) {
            this.debugLog(`MMM-WallpaperColorExtractor: Error selecting color: ${error.message}`);
            return null;
        }
    },
    
    // Process a remote wallpaper
    processRemoteWallpaper: function(wallpaperUrl, config) {
        if (!wallpaperUrl) {
            console.error("MMM-WallpaperColorExtractor: No URL provided");
            return;
        }
        
        const self = this;
        const urlHash = crypto.createHash('md5').update(wallpaperUrl).digest('hex');
        const cachedImagePath = path.join(this.cachePath, urlHash + '.jpg');
        
        // Check if image is already cached
        if (fs.existsSync(cachedImagePath)) {
            this.debugLog(`MMM-WallpaperColorExtractor: Using cached image for ${wallpaperUrl}`);
            this.extractColorFromImage(cachedImagePath, config);
            return;
        }
        
        this.debugLog(`MMM-WallpaperColorExtractor: Downloading image from ${wallpaperUrl}`);
        
        // Parse the URL to determine if we need http or https
        const parsedUrl = url.parse(wallpaperUrl);
        const httpModule = parsedUrl.protocol === 'https:' ? https : http;
        
        const request = httpModule.get(wallpaperUrl, (response) => {
            if (response.statusCode !== 200) {
                this.debugLog(`MMM-WallpaperColorExtractor: Failed to download image: ${response.statusCode}`);
                return;
            }

            const fileStream = fs.createWriteStream(cachedImagePath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                this.debugLog(`MMM-WallpaperColorExtractor: Successfully downloaded image to ${cachedImagePath}`);

                // Now extract color from the downloaded image
                self.extractColorFromImage(cachedImagePath, config);
            });
        });

        request.setTimeout(30000, () => {
            request.destroy();
            console.error("MMM-WallpaperColorExtractor: Remote wallpaper download timed out");
            const fallbackIndex = Math.floor(Math.random() * config.fallbackColors.length);
            self.sendSocketNotification("COLOR_EXTRACTED", {
                success: false,
                color: config.fallbackColors[fallbackIndex],
                source: "download-timeout",
                error: "Request timed out"
            });
        });

        request.on('error', (err) => {
            this.debugLog(`MMM-WallpaperColorExtractor: Error downloading image: ${err.message}`);

            // Send fallback color
            const fallbackIndex = Math.floor(Math.random() * config.fallbackColors.length);
            const fallbackColor = config.fallbackColors[fallbackIndex];

            self.sendSocketNotification("COLOR_EXTRACTED", {
                success: false,
                color: fallbackColor,
                source: "download-error",
                error: err.message
            });
        });
    },
    
    // Search for wallpapers in common locations
    searchForWallpapers: function() {
        this.debugLog("MMM-WallpaperColorExtractor: Searching for wallpapers in common locations");
        
        // List of common locations to check for wallpapers
        const potentialDirs = [
            // MMM-Wallpaper related (relative paths work across all installs)
            path.resolve(__dirname, "../MMM-Wallpaper/cache"),
            path.resolve(__dirname, "../../MMM-Wallpaper/cache"),

            // Common system locations
            path.resolve(__dirname, "../../../modules/default/background"),
            "/usr/share/backgrounds"
        ];
        
        // Try each directory
        for (const dir of potentialDirs) {
            if (this.searchedDirs.includes(dir)) {
                continue; // Skip dirs we've already checked
            }
            
            this.searchedDirs.push(dir);
            this.debugLog(`MMM-WallpaperColorExtractor: Checking directory: ${dir}`);
            
            if (fs.existsSync(dir)) {
                try {
                    const files = fs.readdirSync(dir);
                    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
                    
                    if (imageFiles.length > 0) {
                        this.debugLog(`MMM-WallpaperColorExtractor: Found ${imageFiles.length} images in ${dir}`);
                        this.wallpaperDir = dir;
                        
                        // Find the newest image
                        let newestFile = "";
                        let newestTime = 0;
                        
                        for (const file of imageFiles) {
                            const filePath = path.join(dir, file);
                            const stats = fs.statSync(filePath);
                            
                            if (stats.mtime.getTime() > newestTime) {
                                newestTime = stats.mtime.getTime();
                                newestFile = filePath;
                            }
                        }
                        
                        if (newestFile) {
                            this.debugLog(`MMM-WallpaperColorExtractor: Found newest image: ${newestFile}`);
                            this.currentWallpaper = newestFile;
                            this.notifyModuleOfWallpaperChange(newestFile);
                            return; // Exit once we've found and processed an image
                        }
                    }
                } catch (error) {
                    this.debugLog(`MMM-WallpaperColorExtractor: Error reading directory ${dir}:`, error.message);
                }
            }
        }
        
        this.debugLog("MMM-WallpaperColorExtractor: Could not find any wallpaper images in common locations");
    },
    
    // Find the MMM-Wallpaper directory from config.js
    findWallpaperDirectory: function(config) {
        this.debugLog("MMM-WallpaperColorExtractor: Finding wallpaper directory");
        
        // Check if we have direct config info
        if (config && config.wallpaperDir) {
            this.debugLog(`MMM-WallpaperColorExtractor: Using provided wallpaper directory: ${config.wallpaperDir}`);
            this.wallpaperDir = config.wallpaperDir;
            this.startWatchingWallpaperDir();
            return;
        }
        
        // Try to read the global config to find MMM-Wallpaper settings
        const configPath = path.resolve(__dirname, "../../../config/config.js");
        this.debugLog(`MMM-WallpaperColorExtractor: Looking for config at: ${configPath}`);
        
        try {
            // Check if config file exists
            if (!fs.existsSync(configPath)) {
                this.debugLog(`MMM-WallpaperColorExtractor: Config file not found: ${configPath}`);
                this.searchForWallpapers();
                return;
            }
            
            // Use regex to extract the MMM-Wallpaper source path from config
            const configContent = fs.readFileSync(configPath, "utf8");
            this.debugLog("MMM-WallpaperColorExtractor: Successfully read config file");
            
            // Look for MMM-Wallpaper module config
            const wallpaperModuleRegex = /module:\s*["']MMM-Wallpaper["'][\s\S]*?config:\s*{[\s\S]*?source:\s*["']([^"']+)["']/;
            const match = configContent.match(wallpaperModuleRegex);
            
            if (match && match[1]) {
                let sourcePath = match[1];
                this.debugLog(`MMM-WallpaperColorExtractor: Found MMM-Wallpaper source in config: ${sourcePath}`);
                
                // Handle local: prefix in the path
                if (sourcePath.startsWith("local:")) {
                    sourcePath = sourcePath.substring(6); // Remove "local:" prefix
                    this.wallpaperDir = sourcePath;
                    this.debugLog(`MMM-WallpaperColorExtractor: Found wallpaper directory from config: ${this.wallpaperDir}`);
                    
                    // Check if directory exists
                    if (fs.existsSync(this.wallpaperDir)) {
                        this.debugLog(`MMM-WallpaperColorExtractor: Wallpaper directory exists: ${this.wallpaperDir}`);
                        this.startWatchingWallpaperDir();
                    } else {
                        this.debugLog(`MMM-WallpaperColorExtractor: Wallpaper directory does not exist: ${this.wallpaperDir}`);
                        this.searchForWallpapers();
                    }
                } else {
                    this.debugLog(`MMM-WallpaperColorExtractor: Source is not a local directory: ${sourcePath}`);
                    // For non-local sources, we can't monitor directly
                    this.searchForWallpapers();
                }
            } else {
                this.debugLog("MMM-WallpaperColorExtractor: Could not find MMM-Wallpaper source in config");
                this.searchForWallpapers();
            }
        } catch (error) {
            console.error("MMM-WallpaperColorExtractor: Error reading config file", error);
            this.searchForWallpapers();
        }
    },
    
    // Start watching the wallpaper directory for changes
    startWatchingWallpaperDir: function() {
        if (!this.wallpaperDir || !fs.existsSync(this.wallpaperDir)) {
            this.debugLog(`MMM-WallpaperColorExtractor: Invalid wallpaper directory: ${this.wallpaperDir}`);
            return;
        }
        
        this.debugLog(`MMM-WallpaperColorExtractor: Starting to watch directory: ${this.wallpaperDir}`);
        
        // Find the most recent image in the directory
        this.findCurrentWallpaper();
        
        // Set up a timer to check for new wallpapers periodically
        // This is more reliable than fs.watch which can be finicky on some systems
        const self = this;
        this.watchTimer = setInterval(function() {
            self.checkForWallpaperChanges();
        }, 10000); // Check every 10 seconds
    },
    
    // Returns the path of the newest image file in dir, or "" if none found
    _findNewestImageIn: function(dir) {
        const files = fs.readdirSync(dir);
        let newestFile = "";
        let newestTime = 0;
        for (const file of files) {
            if (!file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) continue;
            const filePath = path.join(dir, file);
            const mtime = fs.statSync(filePath).mtime.getTime();
            if (mtime > newestTime) {
                newestTime = mtime;
                newestFile = filePath;
            }
        }
        return newestFile;
    },

    // Find the most recent image in the wallpaper directory
    findCurrentWallpaper: function() {
        try {
            this.debugLog(`MMM-WallpaperColorExtractor: Finding current wallpaper in: ${this.wallpaperDir}`);
            const newestFile = this._findNewestImageIn(this.wallpaperDir);
            if (newestFile) {
                this.debugLog(`MMM-WallpaperColorExtractor: Found newest image: ${newestFile}`);
                if (newestFile !== this.currentWallpaper) {
                    this.currentWallpaper = newestFile;
                    this.notifyModuleOfWallpaperChange(this.currentWallpaper);
                } else {
                    this.debugLog(`MMM-WallpaperColorExtractor: Wallpaper unchanged: ${this.currentWallpaper}`);
                }
            } else {
                this.debugLog("MMM-WallpaperColorExtractor: No image files found in directory");
            }
        } catch (error) {
            console.error("MMM-WallpaperColorExtractor: Error finding current wallpaper", error);
        }
    },

    // Check for wallpaper changes
    checkForWallpaperChanges: function() {
        try {
            const newestFile = this._findNewestImageIn(this.wallpaperDir);
            if (newestFile && newestFile !== this.currentWallpaper) {
                this.debugLog(`MMM-WallpaperColorExtractor: Detected wallpaper change to: ${newestFile}`);
                this.currentWallpaper = newestFile;
                this.notifyModuleOfWallpaperChange(newestFile);
            }
        } catch (error) {
            console.error("MMM-WallpaperColorExtractor: Error checking for wallpaper changes", error);
        }
    },
    
    // Notify the module of a wallpaper change
    notifyModuleOfWallpaperChange: function(wallpaperPath) {
        this.debugLog(`MMM-WallpaperColorExtractor: Notifying module of wallpaper change: ${wallpaperPath}`);
        this.sendSocketNotification("WALLPAPER_CHANGED", {
            wallpaperPath: wallpaperPath
        });
    },
    
    // Stop the file watcher when shutting down
    stop: function() {
        if (this.watchTimer) {
            clearInterval(this.watchTimer);
            this.watchTimer = null;
        }
    },

    /**
     * Sends error response to the frontend
     */
    sendErrorResponse: function(config, errorMessage) {
        console.error(`MMM-WallpaperColorExtractor: ${errorMessage}`);
        this.sendSocketNotification("COLOR_EXTRACTED", {
            success: false,
            color: config.defaultColor,
            source: "error",
            error: errorMessage
        });
    }
});