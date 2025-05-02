/* Magic Mirror
 * Module: MMM-WallpaperColorExtractor
 *
 * By TypicalFunktion
 * MIT License
 */

Module.register("MMM-WallpaperColorExtractor", {
    // Default module config
    defaults: {
        updateInterval: 10 * 1000, // 10 seconds
        animationSpeed: 2 * 1000, // 2 seconds
        defaultColor: "#90d5ff",   // Default color if extraction fails
        minBrightness: 0.5,        // Minimum brightness (0-1)
        maxBrightness: 0.9,        // Maximum brightness (0-1)
        minSaturation: 0.4,        // Minimum saturation (0-1)
        targetVariable: "--color-text-highlight", // CSS variable to update
        colorExtractionMethod: "vibrant", // vibrant, muted, or random
        disableHolidayColors: false, // Set to true to disable special holiday colors
        enableWeatherColors: true, // Enable weather-based colors
        enableTimeColors: true,    // Enable time-of-day-based colors
        wallpaperDir: "", // Path to your wallpaper directory (leave empty for auto-detection)
        samplingRatio: 0.1, // Sample 10% of the pixels for large images
        debugMode: true, // Set to false to reduce console output
        observeInterval: 2000, // How often to check the DOM for new wallpaper (in ms)
        priorityOrder: [
            "holiday", // Highest priority - if it's a holiday, use that color
            "wallpaper", // Fallback to wallpaper extraction            
            "weather", // If there's severe weather, use that color
            "time"    // Time of day colors
        ],
        
        // Weather-based colors (to match compliments)
        weatherColors: {},
        
        // Time-of-day colors (to match compliments)
        timeColors: {},
        
        // Fallback color scheme to choose from if no good vibrant color is found
        fallbackColors: [
            "#90d5ff", // Light Blue (Original)
            "#FF9AA2", // Light Red
            "#FFB347", // Light Orange
            "#B5EAD7", // Light Green
            "#C7CEEA", // Light Purple
            "#FFDAC1", // Light Peach
            "#AEC6CF", // Pastel Blue
            "#77DD77", // Pastel Green
            "#FFB6C1", // Light Pink
            "#E6E6FA"  // Lavender
        ],
        
        // Special colors for holidays/seasons (format: "MM-DD": "#hexcolor")
        holidayColors: {
            // Special Days - January
            "01-01": "#C0C0C0", // New Year's Day (Silver)

            // Special Days - February
            "02-02": "#6B8E9F", // Groundhog Day (Cloudy blue-gray)
            "02-11": "#FFB6C1", // Godmother Kim's Birthday (Light pink)
            "02-14": "#FF69B4", // Valentine's Day (Hot pink)

            // Special Days - March
            "03-02": "#BF5700", // Texas Independence Day (Burnt orange - Texas color)
            "03-03": "#FFC222", // 303 Day (Denver gold)
            "03-06": "#DC143C", // Casimir Pulaski Day (Polish flag red)
            "03-14": "#3141592", // Pi Day (A blue based on pi digits!)
            "03-17": "#00FF00", // St. Patrick's Day (Bright green)
            "03-18": "#FFA0A0", // Keelee's Birthday (Light pink from your CSS)

            // Special Days - April
            "04-20": "#9932CC", // Godfather Tim's Birthday (Purple)
            "04-28": "#000080", // Scotsman's Birthday (Navy blue - Scottish flag color)

            // Special Days - May
            "05-04": "#4BD5EE", // Star Wars Day (Lightsaber blue)
            "05-05": "#FF4500", // Cinco de Mayo (Mexican flag red)
            "05-06": "#8B0000", // Revenge of the 6th (Sith red)
            "05-23": "#FF69B4", // Godmother Erin's Birthday (Hot pink)
            "05-25": "#A52A2A", // Billy's Adoptiversary (Warm brown)

            // Special Days - June
            "06-26": "#FFCC00", // IKEA Anniversary (IKEA yellow)

            // Special Days - July
            "07-04": "#3C3B6E", // Independence Day (US flag blue)
            "07-08": "#FF1493", // When you met (Deep pink - romantic)
            "07-25": "#800080", // Mommy's Birthday (Purple)

            // Special Days - August
            "08-01": "#2596be", // Colorado Day (Colorado flag blue)

            // Special Days - September
            "09-08": "#4682B4", // Godfather Wally's Birthday (Steel blue)
            "09-13": "#45E201", // Ridley's Birthday (Green from your CSS)

            // Special Days - October
            "10-01": "#8B4513", // Sherpa's Birthday (Dog-colored brown)
            "10-15": "#0033AA", // Southwest Anniversary (Southwest Airlines blue)
            "10-19": "#33CCFF", // Wally's Birthday & Anniversary (Blue from your CSS)
            "10-22": "#400080", // Daddy's Birthday (Deep purple)
            "10-31": "#FF6700", // Halloween (Pumpkin orange)

            // Special Days - November
            "11-11": "#B22222", // Veterans Day (Firebrick red)

            // Special Days - December
            "12-07": "#000080", // Pearl Harbor Day (Navy blue)
            "12-24": "#198754", // Christmas Eve (Christmas green)
            "12-25": "#FF0000", // Christmas (Red)
            "12-26": "#8E562E", // Boxing Day (Brown - cardboard box color)
            "12-27": "#87CEEB", // Post Christmas (Light blue) 
            "12-28": "#87CEEB", // Post Christmas (Light blue)
            "12-29": "#87CEEB", // Post Christmas (Light blue)
            "12-30": "#87CEEB", // Post Christmas (Light blue)
            "12-31": "#C0C0C0", // New Year's Eve (Silver)

            // Specific dates
            "2025-04-20": "#E6C9D1", // Easter 2025 (Light pink - Easter egg color)
            "2025-05-11": "#FFC0CB", // Mother's Day 2025 (Pink)
            "2025-05-26": "#0000CD", // Memorial Day 2025 (Medium blue)
            "2025-06-15": "#000080", // Father's Day 2025 (Navy blue)
            "2025-09-01": "#4B6F44", // Labor Day 2025 (Worker's green)
            "2025-11-27": "#CD853F"  // Thanksgiving 2025 (Peru/tan - turkey color)
        },
        
        // Month-based seasonal colors (if no specific day is defined)
        monthColors: {},
        
        // WCAG and performance settings
        minContrastRatio: 4.5,     // WCAG 2.1 AA standard
        maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
        maxCacheSize: 50,
        imageResizeOptions: {
            width: 800,
            height: 600,
            fit: 'inside'
        },
        colorUpdateDebounceDelay: 250
    },
    
    // Store state variables
    currentColor: null,
    currentColorSource: null,
    currentWallpaperURL: null,
    lastObservedSrc: null,
    observeTimer: null,
    wallpaperObserver: null,
    
    // Debug logging function
    debug: function(...args) {
        if (this.config.debugMode) {
            console.log("MMM-WallpaperColorExtractor [DEBUG]:", ...args);
        }
    },
    
    // Override start method
    start: function() {
        Log.info("Starting module: " + this.name);
        this.debug("Module configuration:", JSON.stringify(this.config));
        
        this.currentColor = this.config.defaultColor;
        this.loaded = false;
        
        // Set the initial CSS variable
        this.updateCssVariable(this.currentColor, "default");
        
        // Subscribe to notifications
        this.debug("Subscribing to notifications");
        
        // Subscribe to wallpaper change notifications
        this.debug("Sending SUBSCRIBE_WALLPAPER_CHANGES notification");
        this.sendSocketNotification("SUBSCRIBE_WALLPAPER_CHANGES", {
            config: this.config
        });
        
        // Check holiday color at startup (highest priority)
        this.checkHolidayColor();
        
        // Start DOM observation manually to avoid relying on MMM-Wallpaper notifications
        this.loaded = true;
    },
    
    // After DOM is ready, set up observation of wallpaper changes
    notificationReceived: function(notification, payload, sender) {
        if (notification === "MODULE_DOM_CREATED") {
            // Wait a bit for all modules to be fully initialized
            setTimeout(() => {
                this.observeWallpaperDOM();
                this.checkForExistingWallpaper();
            }, 5000);
        }
        
        // Listen for weather notifications
        if (notification === "CURRENT_WEATHER" && this.config.enableWeatherColors) {
            this.debug("Received current weather data:", payload);
            
            // Only apply weather color if it's higher priority than current color source
            const currentPriority = this.config.priorityOrder.indexOf(this.currentColorSource);
            const weatherPriority = this.config.priorityOrder.indexOf("weather");
            
            if (weatherPriority < currentPriority || currentPriority === -1) {
                this.processWeatherData(payload);
            }
        }
    },
    
    // Create a MutationObserver to watch for wallpaper changes in the DOM
    observeWallpaperDOM: function() {
        this.debug("Setting up observation of wallpaper images in DOM");
        
        // Start periodic checking for images
        const self = this;
        this.observeTimer = setInterval(() => {
            self.checkForWallpaperImages();
        }, this.config.observeInterval);
    },
    
    // Check for new wallpaper images in the DOM
    checkForWallpaperImages: function() {
        // Look for MMM-Wallpaper images
        const wallpaperImages = document.querySelectorAll(".MMM-Wallpaper img");
        
        if (wallpaperImages.length > 0) {
            // Get the most recent/visible image
            for (let i = wallpaperImages.length - 1; i >= 0; i--) {
                const img = wallpaperImages[i];
                
                // Skip if it's the same image we already processed
                if (img.src === this.lastObservedSrc) {
                    continue;
                }
                
                // We found a new image, process it
                this.debug("Found new wallpaper image:", img.src);
                this.lastObservedSrc = img.src;
                this.handleWallpaperImageUrl(img.src);
                return; // Process only one new image at a time
            }
        } else {
            // If no MMM-Wallpaper images, check for any background images
            this.checkForBackgroundImages();
        }
    },
    
    // Check for background images in the DOM
    checkForBackgroundImages: function() {
        // Look for elements with background-image style
        const elements = document.querySelectorAll(".region.fullscreen_below");
        
        for (let i = 0; i < elements.length; i++) {
            const style = window.getComputedStyle(elements[i]);
            const bgImage = style.backgroundImage;
            
            if (bgImage && bgImage !== "none") {
                // Extract URL from CSS background-image
                const urlMatch = bgImage.match(/url\(['"]?([^'"()]+)['"]?\)/i);
                if (urlMatch && urlMatch[1]) {
                    const imgUrl = urlMatch[1];
                    
                    // Skip if it's the same image we already processed
                    if (imgUrl === this.lastObservedSrc) {
                        continue;
                    }
                    
                    // We found a new background image
                    this.debug("Found new background image:", imgUrl);
                    this.lastObservedSrc = imgUrl;
                    this.handleWallpaperImageUrl(imgUrl);
                    return; // Process only one new image at a time
                }
            }
        }
    },
    
    // Process a wallpaper image URL
    handleWallpaperImageUrl: function(imgUrl) {
        if (imgUrl.startsWith("http") && !imgUrl.includes("localhost") && !imgUrl.includes("127.0.0.1")) {
            // This is a remote URL, send it to the helper for downloading
            this.debug("Processing remote wallpaper URL:", imgUrl);
            this.sendSocketNotification("PROCESS_REMOTE_WALLPAPER", {
                url: imgUrl,
                config: this.config
            });
        } else {
            // This is a local file URL, convert to file path
            try {
                const fileUrl = new URL(imgUrl);
                let filePath = decodeURIComponent(fileUrl.pathname);
                
                // For localhost URLs on Windows, remove the leading slash
                if (process.platform === 'win32' && filePath.startsWith('/')) {
                    filePath = filePath.substring(1);
                }
                
                this.debug("Local wallpaper path:", filePath);
                this.processNewWallpaper(filePath);
            } catch (e) {
                this.debug("Error parsing image URL:", e.message);
            }
        }
    },
    
    // Check for existing wallpaper
    checkForExistingWallpaper: function() {
        this.debug("Checking for existing wallpaper...");
        
        // Look for wallpaper from MMM-Wallpaper module
        const wallpaperModules = document.querySelectorAll(".MMM-Wallpaper");
        this.debug("Found MMM-Wallpaper modules:", wallpaperModules.length);
        
        if (wallpaperModules.length > 0) {
            for (let i = 0; i < wallpaperModules.length; i++) {
                const module = wallpaperModules[i];
                
                // Check for images
                const images = module.querySelectorAll("img");
                if (images.length > 0) {
                    this.debug("Found images:", images.length);
                    
                    // Use the most recent image (last in the DOM)
                    const lastImage = images[images.length - 1];
                    
                    if (lastImage.src) {
                        this.debug("Found wallpaper image:", lastImage.src);
                        this.lastObservedSrc = lastImage.src;
                        this.handleWallpaperImageUrl(lastImage.src);
                        return; // Exit once we've found and processed an image
                    }
                }
            }
        }
        
        // If no MMM-Wallpaper images found, check for any background images
        this.checkForBackgroundImages();
    },
    
    // Socket notification received
    socketNotificationReceived: function(notification, payload) {
        this.debug("Received socket notification:", notification);
        
        if (notification === "WALLPAPER_CHANGED") {
            this.debug("Wallpaper path:", payload.wallpaperPath);
            this.processNewWallpaper(payload.wallpaperPath);
        } 
        else if (notification === "COLOR_EXTRACTED") {
            if (payload && payload.color) {
                // Create a detailed source description
                let sourceInfo = "unknown";
                
                if (payload.source) {
                    sourceInfo = payload.source;
                    if (payload.fileInfo) {
                        sourceInfo += " from " + payload.fileInfo;
                    }
                    if (payload.method) {
                        sourceInfo += " (" + payload.method + " method)";
                    }
                }
                
                // Only apply wallpaper color if it's higher priority than current color source
                const currentPriority = this.config.priorityOrder.indexOf(this.currentColorSource);
                const wallpaperPriority = this.config.priorityOrder.indexOf("wallpaper");
                
                if (wallpaperPriority < currentPriority || currentPriority === -1) {
                    this.debug("Applying wallpaper color:", payload.color);
                    this.currentColor = payload.color;
                    this.currentColorSource = "wallpaper";
                    this.updateCssVariable(this.currentColor, sourceInfo);
                } else {
                    this.debug("Not applying wallpaper color due to priority. Current source:", 
                              this.currentColorSource, "Priority:", currentPriority);
                }
            }
        }
    },
    
    // Process weather data to set appropriate colors
    processWeatherData: function(weatherData) {
        if (!weatherData || !weatherData.weatherType) {
            return;
        }
        
        const weatherType = weatherData.weatherType.toLowerCase();
        const isNight = (weatherData.isDayTime === false);
        let weatherColor = null;
        let weatherKey = null;
        
        // Check for night-specific weather conditions
        if (isNight) {
            if (weatherType.includes("rain") || weatherType.includes("shower")) {
                weatherKey = "night_rain";
            } else if (weatherType.includes("snow")) {
                weatherKey = "night_snow";
            } else if (weatherType.includes("thunder")) {
                weatherKey = "night_thunderstorm";
            } else if (weatherType.includes("shower")) {
                weatherKey = "night_showers";
            }
        } else {
            // Daytime weather conditions
            if (weatherType.includes("rain")) {
                weatherKey = "rain";
            } else if (weatherType.includes("snow")) {
                weatherKey = "snow";
            } else if (weatherType.includes("thunder")) {
                weatherKey = "thunderstorm";
            } else if (weatherType.includes("shower")) {
                weatherKey = "showers";
            }
        }
        
        // Get color from config
        if (weatherKey && this.config.weatherColors[weatherKey]) {
            weatherColor = this.config.weatherColors[weatherKey];
            
            this.debug("Using weather color for", weatherKey + ":", weatherColor);
            this.currentColor = weatherColor;
            this.currentColorSource = "weather";
            this.updateCssVariable(weatherColor, "weather-" + weatherKey);
        }
    },
    
    // Check for holiday color - runs only once at startup
    checkHolidayColor: function() {
        this.debug("Checking for holiday color (once at startup)");
        
        // Check if we should use a holiday color for today
        const holidayColor = this.getHolidayColorForToday();
        if (!this.config.disableHolidayColors && holidayColor) {
            this.debug("Using holiday color:", holidayColor);
            this.currentColor = holidayColor;
            this.currentColorSource = "holiday";
            this.updateCssVariable(this.currentColor, "holiday");
            return true;
        }
        
        return false;
    },
    
    // Extract vibrant color from image
    processNewWallpaper: function(imagePath) {
        if (!imagePath) {
            this.debug("No image path provided, skipping extraction");
            return;
        }
        
        // Skip extraction if holiday is active (highest priority)
        if (this.currentColorSource === "holiday") {
            this.debug("Holiday color active, skipping wallpaper color extraction");
            return;
        }
        
        this.debug("Processing wallpaper:", imagePath);
        
        // Use server-side extraction via node_helper
        this.sendSocketNotification("EXTRACT_COLOR", {
            imagePath: imagePath,
            config: this.config
        });
    },
    
    // Get today's holiday color if applicable
    getHolidayColorForToday: function() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        
        this.debug("Checking holiday colors for date:", year + "-" + month + "-" + day);
        
        // First check for specific date including year (for moving holidays like Easter)
        const yearSpecificKey = year + "-" + month + "-" + day;
        if (this.config.holidayColors[yearSpecificKey]) {
            this.debug("Found year-specific holiday color:", this.config.holidayColors[yearSpecificKey]);
            return this.config.holidayColors[yearSpecificKey];
        }
        
        // Check for specific day holiday color
        const dateKey = month + "-" + day;
        if (this.config.holidayColors[dateKey]) {
            this.debug("Found holiday color for specific date:", this.config.holidayColors[dateKey]);
            return this.config.holidayColors[dateKey];
        }
        
        // Check for month-based seasonal color
        if (this.config.monthColors[month]) {
            this.debug("Found seasonal color for month:", this.config.monthColors[month]);
            return this.config.monthColors[month];
        }
        
        this.debug("No holiday or seasonal color found for today");
        return null;
    },
    
    // Update CSS variable with new color
    updateCssVariable: function(color, source) {
        if (!color) {
            this.debug("No color provided to updateCssVariable");
            return;
        }
        
        // Set default source if not provided
        source = source || "unknown";
        
        this.debug("Updating CSS variable", this.config.targetVariable, "to", color, "from source:", source);
        
        // Apply the color
        document.documentElement.style.setProperty(this.config.targetVariable, color);
        
        // Add a visible console log to show the selected color and source
        console.log("%c Selected Color: " + color + " (" + source + ") ", 
            "background-color: " + color + "; color: " + this.getContrastColor(color) + "; font-size: 14px; padding: 4px 8px; border-radius: 4px;");
        
        // Broadcast the color change to other modules
        this.sendNotification("COLOR_THEME_CHANGED", { 
            variable: this.config.targetVariable,
            color: color,
            source: source
        });
    },
    
    // Determine contrasting text color for the log
    getContrastColor: function(hexColor) {
        // If no color provided, return white
        if (!hexColor) return "#FFFFFF";
        
        // Remove the hash if present
        hexColor = hexColor.replace('#', '');
        
        // Convert the hex to RGB
        let r, g, b;
        if (hexColor.length === 3) {
            r = parseInt(hexColor.charAt(0) + hexColor.charAt(0), 16);
            g = parseInt(hexColor.charAt(1) + hexColor.charAt(1), 16);
            b = parseInt(hexColor.charAt(2) + hexColor.charAt(2), 16);
        } else {
            r = parseInt(hexColor.substr(0, 2), 16);
            g = parseInt(hexColor.substr(2, 2), 16);
            b = parseInt(hexColor.substr(4, 2), 16);
        }
        
        // Calculate the luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return white for dark colors and black for light colors
        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    },
    
    // Clean up on stop
    stop: function() {
        if (this.observeTimer) {
            clearInterval(this.observeTimer);
            this.observeTimer = null;
        }
    },
    
    // Override DOM generator
    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.style.display = "none"; // This module doesn't need visual elements
        return wrapper;
    },
});