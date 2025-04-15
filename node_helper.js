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
const Vibrant = require('node-vibrant');

module.exports = NodeHelper.create({
    // Initialize the helper
    start: function() {
        console.log("Starting node helper for: " + this.name);
        this.isListening = false;
        this.wallpaperDir = "";
        this.currentWallpaper = "";
        this.watchTimer = null;
    },
    
    // Socket notification received from module
    socketNotificationReceived: function(notification, payload) {
        if (notification === "SUBSCRIBE_WALLPAPER_CHANGES") {
            if (!this.isListening) {
                // Start monitoring the wallpaper directory
                this.findWallpaperDirectory(payload.config);
                this.isListening = true;
            }
        }
        else if (notification === "EXTRACT_COLOR") {
            // Extract color from the image
            this.extractColorFromImage(payload.imagePath, payload.config);
        }
    },
    
    // Extract color from image using node-vibrant
    extractColorFromImage: function(imagePath, config) {
        if (!imagePath || !fs.existsSync(imagePath)) {
            console.log("MMM-WallpaperColorExtractor: Invalid image path: " + imagePath);
            this.sendSocketNotification("COLOR_EXTRACTED", {
                success: false,
                color: config.defaultColor
            });
            return;
        }

        console.log("MMM-WallpaperColorExtractor: Extracting color from: " + imagePath);
        
        // Using Vibrant v4.x API
        Vibrant.from(imagePath)
            .quality(5) // Lower quality for better performance
            .maxColorCount(64) // Number of colors to extract
            .getPalette()
            .then((palette) => {
                let selectedColor = null;
                
                // Choose color based on extraction method
                switch (config.colorExtractionMethod) {
                    case "vibrant":
                        if (palette.Vibrant) {
                            selectedColor = palette.Vibrant.hex;
                        } else if (palette.LightVibrant) {
                            selectedColor = palette.LightVibrant.hex;
                        }
                        break;
                    case "muted":
                        if (palette.Muted) {
                            selectedColor = palette.Muted.hex;
                        } else if (palette.LightMuted) {
                            selectedColor = palette.LightMuted.hex;
                        }
                        break;
                    case "random":
                    default:
                        // Try to find a good color from all available swatches
                        const allSwatches = [];
                        for (let key in palette) {
                            if (palette[key]) {
                                allSwatches.push(palette[key]);
                            }
                        }
                        
                        // Filter swatches by brightness and saturation
                        const goodSwatches = allSwatches.filter((swatch) => {
                            const rgb = swatch.rgb;
                            const hsl = this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
                            
                            return (hsl[1] >= config.minSaturation && 
                                    hsl[2] >= config.minBrightness && 
                                    hsl[2] <= config.maxBrightness);
                        });
                        
                        if (goodSwatches.length > 0) {
                            // Pick a random good swatch
                            const randomIndex = Math.floor(Math.random() * goodSwatches.length);
                            selectedColor = goodSwatches[randomIndex].hex;
                        }
                        break;
                }
                
                // If no suitable color found, use a random color from fallback list
                let success = true;
                let colorSource = "";
                
                if (!selectedColor) {
                    const fallbackIndex = Math.floor(Math.random() * config.fallbackColors.length);
                    selectedColor = config.fallbackColors[fallbackIndex];
                    success = false;
                    colorSource = "fallback";
                    console.log("MMM-WallpaperColorExtractor: Using fallback color: " + selectedColor);
                } else {
                    if (config.colorExtractionMethod === "vibrant") {
                        colorSource = palette.Vibrant ? "vibrant" : "light-vibrant";
                    } else if (config.colorExtractionMethod === "muted") {
                        colorSource = palette.Muted ? "muted" : "light-muted";
                    } else {
                        colorSource = "random-filtered";
                    }
                    console.log("MMM-WallpaperColorExtractor: Extracted color: " + selectedColor + " (source: " + colorSource + ")");
                }
                
                // Send the color back to the module with detailed info
                this.sendSocketNotification("COLOR_EXTRACTED", {
                    success: success,
                    color: selectedColor,
                    source: colorSource,
                    method: config.colorExtractionMethod,
                    fileInfo: path.basename(imagePath)
                });
            })
            .catch((error) => {
                console.log("MMM-WallpaperColorExtractor: Error extracting color", error);
                // Use fallback color
                const fallbackIndex = Math.floor(Math.random() * config.fallbackColors.length);
                const fallbackColor = config.fallbackColors[fallbackIndex];
                
                this.sendSocketNotification("COLOR_EXTRACTED", {
                    success: false,
                    color: fallbackColor,
                    source: "error-fallback",
                    method: config.colorExtractionMethod,
                    fileInfo: path.basename(imagePath),
                    error: error.message
                });
            });
    },
    
    // Utility: Convert RGB to HSL
    rgbToHsl: function(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return [h, s, l];
    },
    
    // Find the MMM-Wallpaper directory from config.js
    findWallpaperDirectory: function(config) {
        // Check if we have direct config info
        if (config && config.wallpaperDir) {
            this.wallpaperDir = config.wallpaperDir;
            this.startWatchingWallpaperDir();
            return;
        }
        
        // Try to read the global config to find MMM-Wallpaper settings
        const configPath = path.resolve(__dirname, "../../../config/config.js");
        
        try {
            // Use regex to extract the MMM-Wallpaper source path from config
            const configContent = fs.readFileSync(configPath, "utf8");
            
            // Look for MMM-Wallpaper module config
            const wallpaperModuleRegex = /module:\s*["']MMM-Wallpaper["'][\s\S]*?config:\s*{[\s\S]*?source:\s*["']([^"']+)["']/;
            const match = configContent.match(wallpaperModuleRegex);
            
            if (match && match[1]) {
                let sourcePath = match[1];
                
                // Handle local: prefix in the path
                if (sourcePath.startsWith("local:")) {
                    sourcePath = sourcePath.substring(6); // Remove "local:" prefix
                    this.wallpaperDir = sourcePath;
                    console.log("MMM-WallpaperColorExtractor: Found wallpaper directory from config: " + this.wallpaperDir);
                    this.startWatchingWallpaperDir();
                } else {
                    console.log("MMM-WallpaperColorExtractor: Source is not a local directory: " + sourcePath);
                    // For non-local sources, we can't monitor directly
                    // We'll attempt to find the cache directory
                    this.findWallpaperCache();
                }
            } else {
                console.log("MMM-WallpaperColorExtractor: Could not find MMM-Wallpaper source in config");
                this.findWallpaperCache();
            }
        } catch (error) {
            console.log("MMM-WallpaperColorExtractor: Error reading config file", error);
            this.findWallpaperCache();
        }
    },
    
    // Find the cache directory for MMM-Wallpaper
    findWallpaperCache: function() {
        const cachePath = path.resolve(__dirname, "../MMM-Wallpaper/cache");
        
        if (fs.existsSync(cachePath)) {
            console.log("MMM-WallpaperColorExtractor: Found wallpaper cache directory: " + cachePath);
            this.wallpaperDir = cachePath;
            this.startWatchingWallpaperDir();
        } else {
            console.log("MMM-WallpaperColorExtractor: Could not find wallpaper cache directory");
            // Fall back to client-side detection through DOM changes
        }
    },
    
    // Start watching the wallpaper directory for changes
    startWatchingWallpaperDir: function() {
        if (!this.wallpaperDir || !fs.existsSync(this.wallpaperDir)) {
            console.log("MMM-WallpaperColorExtractor: Invalid wallpaper directory: " + this.wallpaperDir);
            return;
        }
        
        console.log("MMM-WallpaperColorExtractor: Starting to watch directory: " + this.wallpaperDir);
        
        // Find the most recent image in the directory
        this.findCurrentWallpaper();
        
        // Set up a timer to check for new wallpapers periodically
        // This is more reliable than fs.watch which can be finicky on some systems
        const self = this;
        this.watchTimer = setInterval(function() {
            self.checkForWallpaperChanges();
        }, 10000); // Check every 10 seconds
    },
    
    // Find the most recent image in the wallpaper directory
    findCurrentWallpaper: function() {
        try {
            const files = fs.readdirSync(this.wallpaperDir);
            let newestFile = "";
            let newestTime = 0;
            
            for (const file of files) {
                // Skip non-image files
                if (!file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    continue;
                }
                
                const filePath = path.join(this.wallpaperDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime.getTime() > newestTime) {
                    newestTime = stats.mtime.getTime();
                    newestFile = filePath;
                }
            }
            
            if (newestFile && newestFile !== this.currentWallpaper) {
                this.currentWallpaper = newestFile;
                console.log("MMM-WallpaperColorExtractor: Current wallpaper: " + this.currentWallpaper);
                this.notifyModuleOfWallpaperChange(this.currentWallpaper);
            }
        } catch (error) {
            console.log("MMM-WallpaperColorExtractor: Error finding current wallpaper", error);
        }
    },
    
    // Check for wallpaper changes
    checkForWallpaperChanges: function() {
        try {
            const files = fs.readdirSync(this.wallpaperDir);
            let newestFile = "";
            let newestTime = 0;
            
            for (const file of files) {
                // Skip non-image files
                if (!file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    continue;
                }
                
                const filePath = path.join(this.wallpaperDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime.getTime() > newestTime) {
                    newestTime = stats.mtime.getTime();
                    newestFile = filePath;
                }
            }
            
            if (newestFile && newestFile !== this.currentWallpaper) {
                console.log("MMM-WallpaperColorExtractor: Detected wallpaper change to: " + newestFile);
                this.currentWallpaper = newestFile;
                this.notifyModuleOfWallpaperChange(this.currentWallpaper);
            }
        } catch (error) {
            console.log("MMM-WallpaperColorExtractor: Error checking for wallpaper changes", error);
        }
    },
    
    // Notify the module of a wallpaper change
    notifyModuleOfWallpaperChange: function(wallpaperPath) {
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
    }
});
