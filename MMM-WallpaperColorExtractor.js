/* Magic Mirror
 * Module: MMM-WallpaperColorExtractor
 *
 * By TypicalFunktion
 * MIT License
 */

Module.register("MMM-WallpaperColorExtractor", {
    // Default module config
    defaults: {
        // Basic settings
        updateInterval: 10000,
        animationSpeed: 2 * 1000, // 2 seconds
        defaultColor: "#90d5ff",   // Default color if extraction fails
        minBrightness: 0.5,        // Minimum brightness (0-1)
        maxBrightness: 0.9,        // Maximum brightness (0-1)
        minSaturation: 0.4,        // Minimum saturation (0-1)
        targetVariable: "--color-text-highlight", // CSS variable to update
        colorExtractionMethod: "vibrant", // vibrant, muted, or random
        
        // Multiple CSS variables support
        cssVariables: {
            primary: "--color-text-highlight",
            secondary: "--color-text-highlight-secondary",
            accent: "--color-accent",
            border: "--color-border"
        },
        
        // Feature toggles
        disableHolidayColors: false, // Set to true to disable special holiday colors
        enableWeatherColors: true, // Enable weather-based colors
        enableTimeColors: true,    // Enable time-of-day-based colors
        enableMultipleVariables: false, // Enable multiple CSS variable updates
        
        // Performance settings
        wallpaperDir: "", // Path to your wallpaper directory (leave empty for auto-detection)
        samplingRatio: 0.1, // Sample 10% of the pixels for large images
        debugMode: false, // Set to false to reduce console output
        debugDisplay: false, // Set to true to show color info on screen
        observeInterval: 2000, // How often to check the DOM for new wallpaper (in ms)
        priorityOrder: ["holiday", "wallpaper", "weather", "time"],
        
        // Error handling and retry settings
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 10000,
        
        // Configuration presets
        preset: "default", // "default", "vibrant", "subtle", "accessible", "performance"
        
        // Weather-based colors (to match compliments)
        weatherColors: {},
        
        // Time-of-day colors (to match compliments)
        timeColors: {},
        
        // Fallback color scheme to choose from if no good vibrant color is found
        fallbackColors: ["#90d5ff", "#FF9AA2", "#FFB347"],
        
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
    
    // Configuration presets
    presets: {
        vibrant: {
            colorExtractionMethod: "vibrant",
            minBrightness: 0.6,
            minSaturation: 0.5,
            updateInterval: 5000
        },
        subtle: {
            colorExtractionMethod: "muted",
            minBrightness: 0.4,
            maxBrightness: 0.7,
            minSaturation: 0.3,
            updateInterval: 10000
        },
        accessible: {
            minContrastRatio: 7.0,
            colorExtractionMethod: "vibrant",
            minBrightness: 0.5,
            maxBrightness: 0.8
        },
        performance: {
            updateInterval: 30000,
            samplingRatio: 0.05,
            observeInterval: 5000,
            maxCacheSize: 25
        }
    },
    
    // Store state variables
    currentColor: null,
    currentColorSource: null,
    currentWallpaperURL: null,
    lastObservedSrc: null,
    observeTimer: null,
    wallpaperObserver: null,
    retryCount: 0,
    isProcessing: false,
    
    // Debug logging function with enhanced error handling
    debug: function(...args) {
        if (this.config.debugMode) {
            console.log("MMM-WallpaperColorExtractor [DEBUG]:", ...args);
        }
    },
    
    // Error logging function
    logError: function(error, context = "") {
        console.error(`MMM-WallpaperColorExtractor [ERROR]${context ? ` [${context}]` : ""}:`, error);
        
        // Send error notification to node helper for potential recovery
        this.sendSocketNotification("ERROR_OCCURRED", {
            error: error.message || error,
            context: context,
            timestamp: Date.now()
        });
    },
    
    // Apply configuration preset
    applyPreset: function(presetName) {
        if (this.presets[presetName]) {
            this.debug(`Applying preset: ${presetName}`);
            Object.assign(this.config, this.presets[presetName]);
        } else {
            this.logError(`Unknown preset: ${presetName}`, "CONFIG");
        }
    },
    
    // Validate configuration
    validateConfig: function() {
        const errors = [];
        
        if (this.config.minBrightness < 0 || this.config.minBrightness > 1) {
            errors.push("minBrightness must be between 0 and 1");
        }
        if (this.config.maxBrightness < 0 || this.config.maxBrightness > 1) {
            errors.push("maxBrightness must be between 0 and 1");
        }
        if (this.config.minSaturation < 0 || this.config.minSaturation > 1) {
            errors.push("minSaturation must be between 0 and 1");
        }
        if (this.config.minContrastRatio < 1 || this.config.minContrastRatio > 21) {
            errors.push("minContrastRatio must be between 1 and 21");
        }
        if (this.config.maxRetries < 0) {
            errors.push("maxRetries must be non-negative");
        }
        
        if (errors.length > 0) {
            this.logError(`Configuration validation failed: ${errors.join(", ")}`, "CONFIG");
            return false;
        }
        
        return true;
    },
    
    // Override start method with enhanced error handling
    start: function() {
        Log.info("Starting module: " + this.name);
        
        try {
            // Apply preset if specified
            if (this.config.preset && this.config.preset !== "default") {
                this.applyPreset(this.config.preset);
            }
            
            // Validate configuration
            if (!this.validateConfig()) {
                this.logError("Module failed to start due to configuration errors", "STARTUP");
                return;
            }
            
            this.debug("Module configuration:", JSON.stringify(this.config));
            
            this.currentColor = this.config.defaultColor;
            this.loaded = false;
            this.retryCount = 0;
            this.isProcessing = false;
            
            // Set the initial CSS variable
            this.updateCssVariables(this.currentColor, "default");
            
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
            
            this.debug("Module started successfully");
        } catch (error) {
            this.logError(error, "STARTUP");
        }
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
            this.handleColorExtractionResult(payload);
        }
        else if (notification === "ERROR_OCCURRED") {
            this.handleNodeHelperError(payload);
        }
        else if (notification === "PERFORMANCE_METRICS") {
            this.handlePerformanceMetrics(payload);
        }
    },
    
    // Handle color extraction results with retry logic
    handleColorExtractionResult: function(payload) {
        try {
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
                
                // Handle multiple colors if available
                if (payload.palette && this.config.enableMultipleVariables) {
                    this.multipleColors = {};
                    Object.keys(payload.palette).forEach(key => {
                        const color = payload.palette[key];
                        if (color && color.getHex) {
                            this.multipleColors[key] = color.getHex();
                        }
                    });
                    this.debug("Multiple colors extracted:", this.multipleColors);
                }
                
                // Only apply wallpaper color if it's higher priority than current color source
                const currentPriority = this.config.priorityOrder.indexOf(this.currentColorSource);
                const wallpaperPriority = this.config.priorityOrder.indexOf("wallpaper");
                
                if (wallpaperPriority < currentPriority || currentPriority === -1) {
                    this.debug("Applying wallpaper color:", payload.color);
                    this.currentColor = payload.color;
                    this.currentColorSource = "wallpaper";
                    this.updateCssVariables(this.currentColor, sourceInfo);
                    
                    // Reset retry count on success
                    this.retryCount = 0;
                    this.isProcessing = false;
                } else {
                    this.debug("Not applying wallpaper color due to priority. Current source:", 
                              this.currentColorSource, "Priority:", currentPriority);
                }
            } else if (payload && payload.success === false) {
                this.handleExtractionError(payload);
            }
        } catch (error) {
            this.logError(error, "COLOR_EXTRACTION_HANDLER");
        }
    },
    
    // Handle extraction errors with retry logic
    handleExtractionError: function(payload) {
        this.logError(`Color extraction failed: ${payload.error}`, "EXTRACTION");
        
        if (this.retryCount < this.config.maxRetries) {
            this.retryCount++;
            this.debug(`Retrying color extraction (attempt ${this.retryCount}/${this.config.maxRetries})`);
            
            setTimeout(() => {
                this.retryColorExtraction();
            }, this.config.retryDelay * this.retryCount);
        } else {
            this.debug("Max retries reached, using fallback color");
            this.useFallbackColor();
            this.retryCount = 0;
            this.isProcessing = false;
        }
    },
    
    // Handle node helper errors
    handleNodeHelperError: function(payload) {
        this.logError(`Node helper error: ${payload.error}`, payload.context);
        
        // Send error to node helper for potential recovery
        this.sendSocketNotification("ERROR_RECOVERY", {
            error: payload.error,
            context: payload.context,
            timestamp: payload.timestamp
        });
    },
    
    // Handle performance metrics
    handlePerformanceMetrics: function(payload) {
        this.debug("Performance metrics:", payload);
        
        // Store performance metrics for debug display
        this.lastPerformanceMetrics = payload;
        
        // Log performance issues
        if (payload.extractionTime > 5000) {
            this.debug("Slow color extraction detected:", payload.extractionTime + "ms");
        }
        
        if (payload.cacheHitRate < 0.5) {
            this.debug("Low cache hit rate:", payload.cacheHitRate);
        }
        
        // Update debug display if enabled
        if (this.config.debugDisplay) {
            this.updateDom();
        }
    },
    
    // Retry color extraction
    retryColorExtraction: function() {
        if (this.currentWallpaperURL) {
            this.debug("Retrying color extraction for:", this.currentWallpaperURL);
            this.sendSocketNotification("EXTRACT_COLOR", {
                imagePath: this.currentWallpaperURL,
                config: this.config,
                retryAttempt: this.retryCount
            });
        }
    },
    
    // Use fallback color when extraction fails
    useFallbackColor: function() {
        const fallbackIndex = Math.floor(Math.random() * this.config.fallbackColors.length);
        const fallbackColor = this.config.fallbackColors[fallbackIndex];
        
        this.debug("Using fallback color:", fallbackColor);
        this.updateCssVariables(fallbackColor, "fallback");
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
            this.updateCssVariables(weatherColor, "weather-" + weatherKey);
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
            this.updateCssVariables(this.currentColor, "holiday");
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
    
    // Enhanced CSS variable update with multiple variables support
    updateCssVariables: function(color, source) {
        try {
            this.debug(`Updating CSS variables with color: ${color} from source: ${source}`);
            
            if (this.config.enableMultipleVariables && this.config.cssVariables) {
                // Update multiple CSS variables
                Object.entries(this.config.cssVariables).forEach(([key, variable]) => {
                    this.updateSingleCssVariable(variable, color, source);
                });
            } else {
                // Update single CSS variable
                this.updateSingleCssVariable(this.config.targetVariable, color, source);
            }
            
            this.currentColor = color;
            this.currentColorSource = source;
            
            // Update debug display if enabled
            if (this.config.debugDisplay) {
                this.updateDom();
            }
            
            // Notify other modules of color change
            this.sendNotification("COLOR_THEME_CHANGED", {
                color: color,
                source: source,
                variable: this.config.targetVariable,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logError(error, "CSS_UPDATE");
        }
    },
    
    // Update a single CSS variable with animation
    updateSingleCssVariable: function(variable, color, source) {
        try {
            const root = document.documentElement;
            const currentValue = getComputedStyle(root).getPropertyValue(variable).trim();
            
            if (currentValue !== color) {
                this.debug(`Updating ${variable}: ${currentValue} -> ${color}`);
                
                // Apply transition animation
                root.style.transition = `all ${this.config.animationSpeed}ms ease-in-out`;
                root.style.setProperty(variable, color);
                
                // Remove transition after animation completes
                setTimeout(() => {
                    root.style.transition = "";
                }, this.config.animationSpeed);
            }
        } catch (error) {
            this.logError(error, "SINGLE_CSS_UPDATE");
        }
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
    
    // Generate color palette from base color
    generateColorPalette: function(baseColor) {
        try {
            const color = Color(baseColor);
            const palette = {
                primary: baseColor,
                secondary: color.rotate(180).hex(),
                accent: color.rotate(120).hex(),
                complementary: color.rotate(180).hex(),
                analogous1: color.rotate(-30).hex(),
                analogous2: color.rotate(30).hex(),
                triadic1: color.rotate(120).hex(),
                triadic2: color.rotate(240).hex(),
                lighter: color.lighten(0.2).hex(),
                darker: color.darken(0.2).hex(),
                muted: color.desaturate(0.3).hex()
            };
            
            this.debug("Generated color palette:", palette);
            return palette;
        } catch (error) {
            this.logError(error, "PALETTE_GENERATION");
            return { primary: baseColor };
        }
    },
    
    // Validate color format
    validateColor: function(color) {
        if (!color) return false;
        
        // Check if it's a valid hex color
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (hexRegex.test(color)) return true;
        
        // Check if it's a valid CSS color name
        const tempElement = document.createElement('div');
        tempElement.style.color = color;
        return tempElement.style.color !== '';
    },
    
    // Get module status for debugging
    getModuleStatus: function() {
        return {
            currentColor: this.currentColor,
            currentColorSource: this.currentColorSource,
            retryCount: this.retryCount,
            isProcessing: this.isProcessing,
            lastObservedSrc: this.lastObservedSrc,
            config: {
                preset: this.config.preset,
                debugMode: this.config.debugMode,
                enableMultipleVariables: this.config.enableMultipleVariables
            }
        };
    },
    
    // Performance monitoring
    startPerformanceTimer: function(operation) {
        this.performanceTimers = this.performanceTimers || {};
        this.performanceTimers[operation] = Date.now();
    },
    
    endPerformanceTimer: function(operation) {
        if (this.performanceTimers && this.performanceTimers[operation]) {
            const duration = Date.now() - this.performanceTimers[operation];
            this.debug(`Performance: ${operation} took ${duration}ms`);
            
            // Send performance metrics to node helper
            this.sendSocketNotification("PERFORMANCE_METRIC", {
                operation: operation,
                duration: duration,
                timestamp: Date.now()
            });
            
            delete this.performanceTimers[operation];
            return duration;
        }
        return 0;
    },
    
    // Enhanced cleanup on stop
    stop: function() {
        this.debug("Stopping module");
        
        try {
            // Clear timers
            if (this.observeTimer) {
                clearInterval(this.observeTimer);
                this.observeTimer = null;
            }
            
            // Clear performance timers
            if (this.performanceTimers) {
                Object.keys(this.performanceTimers).forEach(timer => {
                    delete this.performanceTimers[timer];
                });
            }
            
            // Reset state
            this.currentColor = null;
            this.currentColorSource = null;
            this.currentWallpaperURL = null;
            this.lastObservedSrc = null;
            this.retryCount = 0;
            this.isProcessing = false;
            
            // Notify node helper of shutdown
            this.sendSocketNotification("MODULE_SHUTDOWN", {
                timestamp: Date.now()
            });
            
            this.debug("Module stopped successfully");
        } catch (error) {
            this.logError(error, "SHUTDOWN");
        }
    },
    
    // Override DOM generator
    getDom: function() {
        const wrapper = document.createElement("div");
        
        // Always log for debugging
        this.debug("getDom called, debugDisplay:", this.config.debugDisplay);
        
        // If debug display is enabled, show color information
        if (this.config.debugDisplay) {
            wrapper.className = "wallpaper-color-debug";
            wrapper.style.display = "block";
            
            const debugInfo = this.getDebugInfo();
            wrapper.innerHTML = debugInfo;
            
            this.debug("Debug display enabled, showing:", debugInfo);
        } else {
            // For testing purposes, show a minimal indicator that the module is loaded
            wrapper.style.display = "block";
            wrapper.style.position = "fixed";
            wrapper.style.top = "5px";
            wrapper.style.left = "5px";
            wrapper.style.background = "rgba(0, 0, 0, 0.7)";
            wrapper.style.color = "white";
            wrapper.style.padding = "5px";
            wrapper.style.borderRadius = "3px";
            wrapper.style.fontSize = "10px";
            wrapper.style.zIndex = "9999";
            wrapper.innerHTML = "WCE Loaded";
            this.debug("Debug display disabled, showing minimal indicator");
        }
        
        return wrapper;
    },
    
    // Get debug information for display
    getDebugInfo: function() {
        if (!this.config.debugDisplay) return "";
        
        const info = [];
        info.push(`<strong>Wallpaper Color Extractor Debug</strong><br>`);
        info.push(`<hr>`);
        
        // Current color info
        if (this.currentColor) {
            info.push(`<div>`);
            info.push(`<span style="color: ${this.currentColor};">●</span> Current Color: ${this.currentColor}<br>`);
            info.push(`Source: ${this.currentColorSource || 'Unknown'}<br>`);
            info.push(`</div>`);
        } else {
            info.push(`<div class="status-error">● No color extracted</div>`);
        }
        
        // Wallpaper info
        if (this.currentWallpaperURL) {
            info.push(`<div>`);
            info.push(`Wallpaper: ${this.currentWallpaperURL.substring(0, 30)}...<br>`);
            info.push(`</div>`);
        }
        
        // Status info
        info.push(`<div>`);
        const statusClass = this.isProcessing ? 'status-processing' : 'status-idle';
        info.push(`Status: <span class="${statusClass}">${this.isProcessing ? 'Processing' : 'Idle'}</span><br>`);
        info.push(`Retries: ${this.retryCount || 0}<br>`);
        info.push(`Preset: ${this.config.preset}<br>`);
        info.push(`</div>`);
        
        // Multiple variables info
        if (this.config.enableMultipleVariables && this.multipleColors) {
            info.push(`<div class="multiple-colors">`);
            info.push(`<strong>Multiple Colors:</strong><br>`);
            Object.keys(this.multipleColors).forEach(key => {
                const color = this.multipleColors[key];
                info.push(`<div class="color-item">`);
                info.push(`<span style="color: ${color};">●</span>`);
                info.push(`<span class="color-name">${key}:</span>`);
                info.push(`<span class="color-value">${color}</span>`);
                info.push(`</div>`);
            });
            info.push(`</div>`);
        }
        
        // Performance info
        if (this.lastPerformanceMetrics) {
            info.push(`<div>`);
            info.push(`<strong>Performance:</strong><br>`);
            const duration = this.lastPerformanceMetrics.duration || 0;
            const durationClass = duration < 1000 ? 'performance-good' : duration < 3000 ? 'performance-warning' : 'performance-poor';
            info.push(`Last extraction: <span class="${durationClass}">${duration}ms</span><br>`);
            info.push(`Cache hits: ${this.lastPerformanceMetrics.cacheHits || 0}<br>`);
            info.push(`</div>`);
        }
        
        return info.join('');
    },
    
    // Get script dependencies
    getScripts: function() {
        return [];
    },
    
    // Get stylesheet dependencies
    getStyles: function() {
        return ["MMM-WallpaperColorExtractor.css"];
    },
    
    // Get translation files
    getTranslations: function() {
        return {
            en: "translations/en.json",
            es: "translations/es.json",
            fr: "translations/fr.json",
            de: "translations/de.json"
        };
    }
});