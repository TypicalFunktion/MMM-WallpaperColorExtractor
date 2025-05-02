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
const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');
const sharp = require('sharp');
const Color = require('color');
const _ = require('lodash');

module.exports = NodeHelper.create({
    // Initialize the helper
    start: function() {
        console.log("Starting node helper for: " + this.name);
        this.isListening = false;
        this.wallpaperDir = "";
        this.currentWallpaper = "";
        this.watchTimer = null;
        this.checkCount = 0;
        this.searchedDirs = [];
        this.cachePath = path.join(__dirname, "cache");
        this.config = null;
        
        // Create cache directory if it doesn't exist
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
    },
    
    // Socket notification received from module
    socketNotificationReceived: function(notification, payload) {
        console.log(`MMM-WallpaperColorExtractor: Received notification: ${notification}`);
        
        if (notification === "SUBSCRIBE_WALLPAPER_CHANGES") {
            console.log("MMM-WallpaperColorExtractor: Subscribing to wallpaper changes");
            this.config = payload.config;
            
            if (!this.isListening) {
                // Start monitoring the wallpaper directory
                this.findWallpaperDirectory(this.config);
                this.isListening = true;
            }
        }
        else if (notification === "EXTRACT_COLOR") {
            console.log(`MMM-WallpaperColorExtractor: Extracting color from: ${payload.imagePath}`);
            // Extract color from the image
            this.extractColorFromImage(payload.imagePath, payload.config || this.config);
        }
        else if (notification === "CHECK_WALLPAPER") {
            console.log("MMM-WallpaperColorExtractor: Manual check for wallpaper requested");
            
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
        }
        else if (notification === "PROCESS_REMOTE_WALLPAPER") {
            console.log(`MMM-WallpaperColorExtractor: Processing remote wallpaper: ${payload.url}`);
            this.processRemoteWallpaper(payload.url, payload.config || this.config);
        }
    },
    
    // Process a remote wallpaper
    processRemoteWallpaper: function(wallpaperUrl, config) {
        if (!wallpaperUrl) {
            console.log("MMM-WallpaperColorExtractor: No URL provided");
            return;
        }
        
        const self = this;
        const urlHash = crypto.createHash('md5').update(wallpaperUrl).digest('hex');
        const cachedImagePath = path.join(this.cachePath, urlHash + '.jpg');
        
        // Check if image is already cached
        if (fs.existsSync(cachedImagePath)) {
            console.log(`MMM-WallpaperColorExtractor: Using cached image for ${wallpaperUrl}`);
            this.extractColorFromImage(cachedImagePath, config);
            return;
        }
        
        console.log(`MMM-WallpaperColorExtractor: Downloading image from ${wallpaperUrl}`);
        
        // Parse the URL to determine if we need http or https
        const parsedUrl = url.parse(wallpaperUrl);
        const httpModule = parsedUrl.protocol === 'https:' ? https : http;
        
        const request = httpModule.get(wallpaperUrl, (response) => {
            if (response.statusCode !== 200) {
                console.log(`MMM-WallpaperColorExtractor: Failed to download image: ${response.statusCode}`);
                return;
            }
            
            const fileStream = fs.createWriteStream(cachedImagePath);
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`MMM-WallpaperColorExtractor: Successfully downloaded image to ${cachedImagePath}`);
                
                // Now extract color from the downloaded image
                self.extractColorFromImage(cachedImagePath, config);
            });
        });
        
        request.on('error', (err) => {
            console.log(`MMM-WallpaperColorExtractor: Error downloading image: ${err.message}`);
            
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
        console.log("MMM-WallpaperColorExtractor: Searching for wallpapers in common locations");
        
        // List of common locations to check for wallpapers
        const potentialDirs = [
            // MMM-Wallpaper related
            path.resolve(__dirname, "../MMM-Wallpaper/cache"),
            path.resolve(__dirname, "../../MMM-Wallpaper/cache"),
            "/home/pi/MagicMirror/modules/MMM-Wallpaper/cache",
            "/home/RYFUN/MagicMirror/modules/MMM-Wallpaper/cache",
            
            // From the RYFUN config
            "/media/RYFUN/display/backgrounds",
            
            // Common system locations
            path.resolve(__dirname, "../../../modules/default/background"),
            "/usr/share/backgrounds",
            "/home/pi/Pictures",
            "/home/RYFUN/Pictures"
        ];
        
        // Try each directory
        for (const dir of potentialDirs) {
            if (this.searchedDirs.includes(dir)) {
                continue; // Skip dirs we've already checked
            }
            
            this.searchedDirs.push(dir);
            console.log(`MMM-WallpaperColorExtractor: Checking directory: ${dir}`);
            
            if (fs.existsSync(dir)) {
                try {
                    const files = fs.readdirSync(dir);
                    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
                    
                    if (imageFiles.length > 0) {
                        console.log(`MMM-WallpaperColorExtractor: Found ${imageFiles.length} images in ${dir}`);
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
                            console.log(`MMM-WallpaperColorExtractor: Found newest image: ${newestFile}`);
                            this.currentWallpaper = newestFile;
                            this.notifyModuleOfWallpaperChange(newestFile);
                            return; // Exit once we've found and processed an image
                        }
                    }
                } catch (error) {
                    console.log(`MMM-WallpaperColorExtractor: Error reading directory ${dir}:`, error.message);
                }
            }
        }
        
        console.log("MMM-WallpaperColorExtractor: Could not find any wallpaper images in common locations");
    },
    
    // Extract color from image using node-vibrant
    extractColorFromImage: async function(imagePath, config) {
        if (!imagePath) {
            this.sendErrorResponse(config, "No image path provided");
            return;
        }

        if (!fs.existsSync(imagePath)) {
            this.sendErrorResponse(config, `File not found: ${imagePath}`);
            return;
        }

        try {
            const processedImage = await this.preprocessImage(imagePath, config);
            const palette = await Vibrant.from(processedImage)
                .quality(5)
                .maxColorCount(32)
                .getPalette();

            // Clean up temporary file
            fs.unlinkSync(processedImage);

            if (!palette) {
                throw new Error("Failed to extract palette");
            }

            let selectedColor = this.selectColorFromPalette(palette, config);
            
            this.sendSocketNotification("COLOR_EXTRACTED", {
                success: true,
                color: selectedColor,
                source: "vibrant"
            });

        } catch (error) {
            this.sendErrorResponse(config, error.message);
        }
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
        console.log("MMM-WallpaperColorExtractor: Finding wallpaper directory");
        
        // Check if we have direct config info
        if (config && config.wallpaperDir) {
            console.log(`MMM-WallpaperColorExtractor: Using provided wallpaper directory: ${config.wallpaperDir}`);
            this.wallpaperDir = config.wallpaperDir;
            this.startWatchingWallpaperDir();
            return;
        }
        
        // Try to read the global config to find MMM-Wallpaper settings
        const configPath = path.resolve(__dirname, "../../../config/config.js");
        console.log(`MMM-WallpaperColorExtractor: Looking for config at: ${configPath}`);
        
        try {
            // Check if config file exists
            if (!fs.existsSync(configPath)) {
                console.log(`MMM-WallpaperColorExtractor: Config file not found: ${configPath}`);
                this.searchForWallpapers();
                return;
            }
            
            // Use regex to extract the MMM-Wallpaper source path from config
            const configContent = fs.readFileSync(configPath, "utf8");
            console.log("MMM-WallpaperColorExtractor: Successfully read config file");
            
            // Look for MMM-Wallpaper module config
            const wallpaperModuleRegex = /module:\s*["']MMM-Wallpaper["'][\s\S]*?config:\s*{[\s\S]*?source:\s*["']([^"']+)["']/;
            const match = configContent.match(wallpaperModuleRegex);
            
            if (match && match[1]) {
                let sourcePath = match[1];
                console.log(`MMM-WallpaperColorExtractor: Found MMM-Wallpaper source in config: ${sourcePath}`);
                
                // Handle local: prefix in the path
                if (sourcePath.startsWith("local:")) {
                    sourcePath = sourcePath.substring(6); // Remove "local:" prefix
                    this.wallpaperDir = sourcePath;
                    console.log(`MMM-WallpaperColorExtractor: Found wallpaper directory from config: ${this.wallpaperDir}`);
                    
                    // Check if directory exists
                    if (fs.existsSync(this.wallpaperDir)) {
                        console.log(`MMM-WallpaperColorExtractor: Wallpaper directory exists: ${this.wallpaperDir}`);
                        this.startWatchingWallpaperDir();
                    } else {
                        console.log(`MMM-WallpaperColorExtractor: Wallpaper directory does not exist: ${this.wallpaperDir}`);
                        this.searchForWallpapers();
                    }
                } else {
                    console.log(`MMM-WallpaperColorExtractor: Source is not a local directory: ${sourcePath}`);
                    // For non-local sources, we can't monitor directly
                    this.searchForWallpapers();
                }
            } else {
                console.log("MMM-WallpaperColorExtractor: Could not find MMM-Wallpaper source in config");
                this.searchForWallpapers();
            }
        } catch (error) {
            console.log("MMM-WallpaperColorExtractor: Error reading config file", error);
            this.searchForWallpapers();
        }
    },
    
    // Start watching the wallpaper directory for changes
    startWatchingWallpaperDir: function() {
        if (!this.wallpaperDir || !fs.existsSync(this.wallpaperDir)) {
            console.log(`MMM-WallpaperColorExtractor: Invalid wallpaper directory: ${this.wallpaperDir}`);
            return;
        }
        
        console.log(`MMM-WallpaperColorExtractor: Starting to watch directory: ${this.wallpaperDir}`);
        
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
            console.log(`MMM-WallpaperColorExtractor: Finding current wallpaper in: ${this.wallpaperDir}`);
            
            const files = fs.readdirSync(this.wallpaperDir);
            console.log(`MMM-WallpaperColorExtractor: Found ${files.length} files in directory`);
            
            let newestFile = "";
            let newestTime = 0;
            let imageCount = 0;
            
            for (const file of files) {
                // Skip non-image files
                if (!file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    continue;
                }
                
                imageCount++;
                const filePath = path.join(this.wallpaperDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime.getTime() > newestTime) {
                    newestTime = stats.mtime.getTime();
                    newestFile = filePath;
                }
            }
            
            console.log(`MMM-WallpaperColorExtractor: Found ${imageCount} image files in directory`);
            
            if (newestFile) {
                console.log(`MMM-WallpaperColorExtractor: Found newest image: ${newestFile}`);
                
                if (newestFile !== this.currentWallpaper) {
                    this.currentWallpaper = newestFile;
                    console.log(`MMM-WallpaperColorExtractor: Current wallpaper: ${this.currentWallpaper}`);
                    this.notifyModuleOfWallpaperChange(this.currentWallpaper);
                } else {
                    console.log(`MMM-WallpaperColorExtractor: Wallpaper unchanged: ${this.currentWallpaper}`);
                }
            } else {
                console.log("MMM-WallpaperColorExtractor: No image files found in directory");
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
                console.log(`MMM-WallpaperColorExtractor: Detected wallpaper change to: ${newestFile}`);
                this.currentWallpaper = newestFile;
                this.notifyModuleOfWallpaperChange(newestFile);
            }
        } catch (error) {
            console.log("MMM-WallpaperColorExtractor: Error checking for wallpaper changes", error);
        }
    },
    
    // Notify the module of a wallpaper change
    notifyModuleOfWallpaperChange: function(wallpaperPath) {
        console.log(`MMM-WallpaperColorExtractor: Notifying module of wallpaper change: ${wallpaperPath}`);
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
     * Ensures cache directory exists and is clean
     */
    ensureCacheDirectory: function() {
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
        this.cleanupCache();
    },

    /**
     * Cleans up old cached files
     */
    cleanupCache: function() {
        const files = fs.readdirSync(this.cachePath);
        const now = Date.now();
        
        files.forEach(file => {
            const filePath = path.join(this.cachePath, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtime.getTime() > this.config.maxCacheAge) {
                fs.unlinkSync(filePath);
            }
        });

        // If we still have too many files, remove oldest
        if (files.length > this.config.maxCacheSize) {
            const sortedFiles = files
                .map(file => ({
                    path: path.join(this.cachePath, file),
                    mtime: fs.statSync(path.join(this.cachePath, file)).mtime
                }))
                .sort((a, b) => a.mtime - b.mtime);

            for (let i = 0; i < sortedFiles.length - this.config.maxCacheSize; i++) {
                fs.unlinkSync(sortedFiles[i].path);
            }
        }
    },

    /**
     * Preprocesses image for color extraction
     */
    async preprocessImage: function(imagePath, config) {
        const tempPath = path.join(this.cachePath, `temp_${path.basename(imagePath)}`);
        
        await sharp(imagePath)
            .resize(
                config.imageResizeOptions.width,
                config.imageResizeOptions.height,
                { fit: config.imageResizeOptions.fit }
            )
            .jpeg({ quality: 80 })
            .toFile(tempPath);
            
        return tempPath;
    },

    /**
     * Selects appropriate color from palette based on config
     */
    selectColorFromPalette: function(palette, config) {
        const validSwatches = [];
        
        for (const [name, swatch] of Object.entries(palette)) {
            if (!swatch) continue;
            
            const { population, rgb } = swatch;
            const [r, g, b] = rgb;
            
            // Calculate color properties
            const color = Color(rgb);
            const brightness = color.lightness() / 100;
            const saturation = color.saturationl() / 100;
            
            if (brightness >= config.minBrightness &&
                brightness <= config.maxBrightness &&
                saturation >= config.minSaturation) {
                validSwatches.push({
                    name,
                    color: swatch.hex,
                    population,
                    brightness
                });
            }
        }
        
        if (validSwatches.length === 0) {
            return config.defaultColor;
        }
        
        // Sort by population and select most prominent color
        validSwatches.sort((a, b) => b.population - a.population);
        return validSwatches[0].color;
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