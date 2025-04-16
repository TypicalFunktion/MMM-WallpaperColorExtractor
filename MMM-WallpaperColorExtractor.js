/* Magic Mirror
 * Module: MMM-WallpaperColorExtractor (with MMM-Wallpaper Integration)
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
        priorityOrder: [
            "holiday", // Highest priority - if it's a holiday, use that color
				"wallpaper", // Fallback to wallpaper extraction
				"weather", // If there's severe weather, use that color
            "time"    // Time of day colors

        ],
        
        // Weather-based colors (to match compliments)
        weatherColors: {
        },
        
        // Time-of-day colors (to match compliments)
        timeColors: {
        },
        
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
            "02-14": "#FF69B4", // Valentine's Day (Hot pink)

            // Special Days - March
            "03-02": "#BF5700", // Texas Independence Day (Burnt orange - Texas color)
            "03-03": "#FFC222", // 303 Day (Denver gold)
            "03-06": "#DC143C", // Casimir Pulaski Day (Polish flag red)
            "03-14": "#3141592", // Pi Day (A blue based on pi digits!)
            "03-17": "#00FF00", // St. Patrick's Day (Bright green)
            
            // Special Days - April
            
            // Special Days - May
            "05-04": "#4BD5EE", // Star Wars Day (Lightsaber blue)
            "05-05": "#FF4500", // Cinco de Mayo (Mexican flag red)
            "05-06": "#8B0000", // Revenge of the 6th (Sith red)
            
            // Special Days - June
            
            // Special Days - July
            "07-04": "#3C3B6E", // Independence Day (US flag blue)
            
            // Special Days - August
            "08-01": "#2596be", // Colorado Day (Colorado flag blue)

            // Special Days - September
            
            // Special Days - October
            "10-31": "#FF6700", // Halloween (Pumpkin orange)

            // Special Days - November
            "11-11": "#B22222", // Veterans Day (Firebrick red)

            // Special Days - December
            "12-24": "#198754", // Christmas Eve (Christmas green)
            "12-25": "#FF0000", // Christmas (Red)
            "12-26": "#8E562E", // Boxing Day (Brown - cardboard box color)
            
            // Specific dates
            "2025-04-20": "#E6C9D1", // Easter 2025 (Light pink - Easter egg color)
            "2025-05-11": "#FFC0CB", // Mother's Day 2025 (Pink)
            "2025-05-26": "#0000CD", // Memorial Day 2025 (Medium blue)
            "2025-06-15": "#000080", // Father's Day 2025 (Navy blue)
            "2025-09-01": "#4B6F44", // Labor Day 2025 (Worker's green)
            "2025-11-27": "#CD853F", // Thanksgiving 2025 (Peru/tan - turkey color)
        },
        
        // Month-based seasonal colors (if no specific day is defined)
        monthColors: {
        },
    },
    
    // Store state variables
    currentColor: null,
    currentColorSource: null,
    currentWallpaperURL: null,
    weatherStatus: null,
    wallpaperImages: [],
    currentImage: null,
    
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
        
        // Set up the observation of DOM for MMM-Wallpaper
        this.observeWallpaperDOM();
        
        // Try to get background URL from DOM if MMM-Wallpaper is loaded
        setTimeout(() => {
            this.checkForExistingWallpaper();
        }, 5000);
        
        this.loaded = true;
    },
    
    // Create a MutationObserver to watch for wallpaper changes in the DOM
    observeWallpaperDOM: function() {
        this.debug("Setting up MutationObserver for wallpaper changes");
        
        if (typeof MutationObserver !== 'undefined') {
            const self = this;
            
            // Create observer to watch for image changes
            this.wallpaperObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Check if any added nodes are images
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeName === 'IMG') {
                                self.debug("Detected new image added to DOM:", node.src);
                                self.handleNewWallpaperImage(node);
                            }
                        });
                    }
                });
            });
            
            // Start observing with a delay to ensure DOM is ready
            setTimeout(() => {
                const wallpaperModules = document.querySelectorAll(".MMM-Wallpaper");
                
                if (wallpaperModules.length > 0) {
                    self.debug("Found MMM-Wallpaper module in DOM, observing it");
                    
                    // Observe each module
                    wallpaperModules.forEach(module => {
                        self.wallpaperObserver.observe(module, {
                            childList: true,
                            subtree: true
                        });
                        
                        // Check for existing images
                        const images = module.querySelectorAll("img");
                        if (images.length > 0) {
                            self.debug("Found existing wallpaper images in DOM:", images.length);
                            images.forEach(img => self.handleNewWallpaperImage(img));
                        }
                    });
                } else {
                    self.debug("MMM-Wallpaper module not found in DOM yet");
                }
            }, 2000);
        } else {
            this.debug("MutationObserver not supported, fallback to polling");
        }
    },
    
    // Handle a new wallpaper image
    handleNewWallpaperImage: function(imgNode) {
        // If it's the same URL as the one we already processed, skip
        if (this.currentWallpaperURL === imgNode.src) {
            this.debug("Skipping already processed image:", imgNode.src);
            return;
        }
        
        this.debug("Processing new wallpaper image:", imgNode.src);
        this.currentWallpaperURL = imgNode.src;
        
        // Only process if it's a local file (not a remote URL)
        if (imgNode.src.startsWith('http') && !imgNode.src.includes('localhost')) {
            this.debug("Remote wallpaper URL detected, sending to node_helper for processing");
            this.sendSocketNotification("PROCESS_REMOTE_WALLPAPER", {
                url: imgNode.src,
                config: this.config
            });
        } else {
            // Extract the file path from the URL
            try {
                const fileUrl = new URL(imgNode.src);
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
                    this.handleNewWallpaperImage(lastImage);
                    return; // Exit once we've found and processed an image
                }
            }
        }
        
        // If no MMM-Wallpaper module found, look for any background images
        const fullscreenModules = document.querySelectorAll(".region.fullscreen_below");
        this.debug("Found fullscreen_below elements:", fullscreenModules.length);
        
        if (fullscreenModules.length > 0) {
            for (let i = 0; i < fullscreenModules.length; i++) {
                const element = fullscreenModules[i];
                
                // Check for images
                const imgs = element.querySelectorAll("img");
                if (imgs.length > 0) {
                    this.debug("Found images in fullscreen region:", imgs.length);
                    
                    // Use the most recent image (last in the DOM)
                    const lastImage = imgs[imgs.length - 1];
                    this.handleNewWallpaperImage(lastImage);
                    return; // Exit once we've found and processed an image
                }
                
                // Check for background-image style
                const bgImage = window.getComputedStyle(element).backgroundImage;
                if (bgImage && bgImage !== "none") {
                    this.debug("Found background image style:", bgImage);
                    
                    // Extract URL from the background-image style
                    const match = bgImage.match(/url\(['"]?([^'"()]*)['"]?\)/i);
                    if (match && match[1]) {
                        const url = match[1];
                        
                        // Create a temporary image element to process
                        const tempImg = document.createElement("img");
                        tempImg.src = url;
                        this.handleNewWallpaperImage(tempImg);
                        return; // Exit once we've found and processed an image
                    }
                }
            }
        }
        
        this.debug("No wallpaper images found in DOM");
    },
    
    // Handle notifications from other modules
    notificationReceived: function(notification, payload, sender) {
        if (!this.loaded) {
            return;
        }
        
        this.debug("Received notification:", notification);
        
        // Listen for notifications from MMM-Wallpaper
        if (notification === "WALLPAPER_CHANGED" && sender && sender.name === "MMM-Wallpaper") {
            this.debug("Wallpaper changed notification from MMM-Wallpaper:", payload);
            
            if (payload && payload.url) {
                this.handleNewWallpaperImage({src: payload.url});
            }
        }
        
        // Listen for WALLPAPER_URL notification (from patched MMM-Wallpaper)
        if (notification === "WALLPAPER_URL" && sender && sender.name === "MMM-Wallpaper") {
            this.debug("Received wallpaper URL from MMM-Wallpaper:", payload);
            
            if (payload) {
                this.handleNewWallpaperImage({src: payload});
            }
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
    
    // Override DOM generator
    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.style.display = "none"; // This module doesn't need visual elements
        return wrapper;
    },
});