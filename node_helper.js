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
        this.checkCount = 0;
        this.searchedDirs = [];
    },
    
    // Socket notification received from module
    socketNotificationReceived: function(notification, payload) {
        console.log(`MMM-WallpaperColorExtractor: Received notification: ${notification}`);
        
        if (notification === "SUBSCRIBE_WALLPAPER_CHANGES") {
            console.log("MMM-WallpaperColorExtractor: Subscribing to wallpaper changes");
            
            if (!this.isListening) {
                // Start monitoring the wallpaper directory
                this.findWallpaperDirectory(payload.config);
                this.isListening = true;
            }
        }
        else if (notification === "EXTRACT_COLOR") {
            console.log(`MMM-WallpaperColorExtractor: Extracting color from: ${payload.imagePath}`);
            // Extract color from the image
            this.extractColorFromImage(payload.imagePath, payload.config);
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
            
            // From config.js
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
    extractColorFromImage: function(imagePath, config) {
        if (!imagePath) {
            console.log("MMM-WallpaperColorExtractor: No image path provided");
            this.sendSocketNotification("COLOR_EXTRACTED", {
                success: false,
                color: config.defaultColor,
                source: "error-no-path"
            });
            return;
        }
        
        // Check if file exists
        const fileExists = fs.existsSync(imagePath);
        console.log(`MMM-WallpaperColorExtractor: File exists: ${fileExists} - ${imagePath}`);
        
        if (!fileExists) {
            console.log(`MMM-WallpaperColorExtractor: File does not exist: ${imagePath}`);
            this.sendSocketNotification("COLOR_EXTRACTED", {
                success: false,
                color: config.defaultColor,
                source: "error-file-not-found",
                error: `File not found: ${imagePath}`
            });
            return;
        }

        console.log(`MMM-WallpaperColorExtractor: Extracting color from: ${imagePath}`);
        
        try {
            // Using Vibrant v4.x API
            Vibrant.from(imagePath)
                .quality(5) // Lower quality for better performance
                .maxColorCount(64) // Number of colors to extract
                .getPalette()
                .then((palette) => {
                    console.log(`MMM-WallpaperColorExtractor: Successfully got palette for: ${imagePath}`);
                    // Log available swatches
                    for (let key in palette) {
                        if (palette[key]) {
                            console.log(`MMM-WallpaperColorExtractor: Found swatch: ${key} - ${palette[key].hex}`);
                        }
                    }
                    
                    let selectedColor = null;
                    
                    // Choose color based on extraction method
                    switch (config.colorExtractionMethod) {
                        case "vibrant":
                            if (palette.Vibrant) {
                                selectedColor = palette.Vibrant.hex;
                                console.log(`MMM-WallpaperColorExtractor: Selected Vibrant swatch: ${selectedColor}`);
                            } else if (palette.LightVibrant) {
                                selectedColor = palette.LightVibrant.hex;
                                console.log(`MMM-WallpaperColorExtractor: Selected LightVibrant swatch: ${selectedColor}`);
                            }
                            break;
                        case "muted":
                            if (palette.Muted) {
                                selectedColor = palette.Muted.hex;
                                console.log(`MMM-WallpaperColorExtractor: Selected Muted swatch: ${selectedColor}`);
                            } else if (palette.LightMuted) {
                                selectedColor = palette.LightMuted.hex;
                                console.log(`MMM-WallpaperColorExtractor: Selected LightMuted swatch: ${selectedColor}`);
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
                            
                            console.log(`MMM-WallpaperColorExtractor: Found ${allSwatches.length} total swatches`);
                            
                            // Filter swatches by brightness and saturation
                            const goodSwatches = allSwatches.filter((swatch) => {
                                const rgb = swatch.rgb;
                                const hsl = this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
                                
                                const meetsMinSaturation = hsl[1] >= config.minSaturation;
                                const meetsMinBrightness = hsl[2] >= config.minBrightness;
                                const meetMaxBrightness = hsl[2] <= config.maxBrightness;
                                
                                console.log(`MMM-WallpaperColorExtractor: Swatch ${swatch.hex} - HSL: ${hsl[0].toFixed(2)}, ${hsl[1].toFixed(2)}, ${hsl[2].toFixed(2)} - Min Sat: ${meetsMinSaturation} - Min Bright: ${meetsMinBrightness} - Max Bright: ${meetMaxBrightness}`);
                                
                                return (meetsMinSaturation && meetsMinBrightness && meetMaxBrightness);
                            });
                            
                            console.log(`MMM-WallpaperColorExtractor: Found ${goodSwatches.length} good swatches after filtering`);
                            
                            if (goodSwatches.length > 0) {
                                // Pick a random good swatch
                                const randomIndex = Math.floor(Math.random() * goodSwatches.length);
                                selectedColor = goodSwatches[randomIndex].hex;
                                console.log(`MMM-WallpaperColorExtractor: Selected random swatch: ${selectedColor}`);
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
                        console.log(`MMM-WallpaperColorExtractor: Using fallback color: ${selectedColor}`);
                    } else {
                        if (config.colorExtractionMethod === "vibrant") {
                            colorSource = palette.Vibrant ? "vibrant" : "light-vibrant";
                        } else if (config.colorExtractionMethod === "muted") {
                            colorSource = palette.Muted ? "muted" : "light-muted";
                        } else {
                            colorSource = "random-filtered";
                        }
                        console.log(`MMM-WallpaperColorExtractor: Extracted color: ${selectedColor} (source: ${colorSource})`);
                    }
                    
                    // Send the color back to the module with detailed info
                    console.log(`MMM-WallpaperColorExtractor: Sending COLOR_EXTRACTED notification with color: ${selectedColor}`);
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
        } catch (outerError) {
            console.log("MMM-WallpaperColorExtractor: Outer error during extraction", outerError);
            const fallbackIndex = Math.floor(Math.random() * config.fallbackColors.length);
            const fallbackColor = config.fallbackColors[fallbackIndex];
            
            this.sendSocketNotification("COLOR_EXTRACTED", {
                success: false,
                color: fallbackColor,
                source: "outer-error-fallback",
                error: outerError.message
            });
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
                this.notifyModuleOfWallpaperChange(this.currentWallpaper);
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
    }
});
