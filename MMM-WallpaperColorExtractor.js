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
        samplingRatio: 0.1, // Sample 10% of the pixels for large images
        debugMode: true, // Set to false to reduce console output
        
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
            // Holidays - specific days
            "01-01": "#C0C0C0",  // New Year's Day (Silver)
            "02-14": "#FF69B4",  // Valentine's Day (Hot Pink)
            "03-17": "#00FF00",  // St. Patrick's Day (Green)
            "07-04": "#0000FF",  // Independence Day (Blue)
            "10-31": "#FFA500",  // Halloween (Orange)
            "11-11": "#B22222",  // Veterans Day (Firebrick)
            "12-25": "#FF0000",  // Christmas (Red)
        },
        
        // Month-based seasonal colors (if no specific day is defined)
        monthColors: {
            "10": "#FF6700", // October - Fall/Halloween theme
            "12": "#006400", // December - Christmas theme
        },
    },
    
    // Store the current vibrant color
    currentColor: null,
    
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
        
        // Subscribe to wallpaper change notifications
        this.debug("Sending SUBSCRIBE_WALLPAPER_CHANGES notification");
        this.sendSocketNotification("SUBSCRIBE_WALLPAPER_CHANGES", {
            config: this.config
        });
        
        // Try to get background URL from DOM if MMM-Wallpaper is loaded
        setTimeout(() => {
            this.checkForExistingWallpaper();
        }, 5000);
        
        // Schedule the first update
        this.scheduleUpdate();
    },
    
    // Check for existing wallpaper
    checkForExistingWallpaper: function() {
        this.debug("Checking for existing wallpaper...");
        
        // Look for wallpaper in the DOM
        const wallpaperElements = document.querySelectorAll(".region.fullscreen_below");
        this.debug("Found fullscreen_below elements:", wallpaperElements.length);
        
        if (wallpaperElements.length > 0) {
            for (let i = 0; i < wallpaperElements.length; i++) {
                const element = wallpaperElements[i];
                this.debug("Checking element:", element);
                
                // Check for background image
                const imgs = element.querySelectorAll("img");
                if (imgs.length > 0) {
                    for (let j = 0; j < imgs.length; j++) {
                        const img = imgs[j];
                        const src = img.src;
                        if (src) {
                            this.debug("Found image source:", src);
                            // For locally loaded images, we should already be handling them
                            // But we can try to extract from the DOM element as a fallback
                        }
                    }
                }
                
                // Check for background-image style
                const bgImage = window.getComputedStyle(element).backgroundImage;
                if (bgImage && bgImage !== "none") {
                    this.debug("Found background image style:", bgImage);
                }
            }
        } else {
            this.debug("No fullscreen_below elements found");
        }
    },
    
    // Schedule next update
    scheduleUpdate: function() {
        this.debug("Scheduling update with interval:", this.config.updateInterval);
        var self = this;
        setInterval(function() {
            self.updateColor();
        }, this.config.updateInterval);
    },
    
    // Update the color based on current method
    updateColor: function() {
        this.debug("Running scheduled color update");
        
        // Check if we should use a holiday color for today
        const holidayColor = this.getHolidayColorForToday();
        if (!this.config.disableHolidayColors && holidayColor) {
            this.debug("Using holiday color:", holidayColor);
            this.currentColor = holidayColor;
            this.updateCssVariable(this.currentColor, "holiday");
        }
    },
    
    // Socket notification received
    socketNotificationReceived: function(notification, payload) {
        this.debug("Received socket notification:", notification, payload);
        
        if (notification === "WALLPAPER_CHANGED") {
            Log.info("MMM-WallpaperColorExtractor: Received wallpaper change notification");
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
                
                Log.info("MMM-WallpaperColorExtractor: Received extracted color: " + payload.color + " - " + sourceInfo);
                this.debug("Received color:", payload.color, "Source:", sourceInfo);
                
                this.currentColor = payload.color;
                
                // Update the CSS with detailed source info
                this.updateCssVariable(this.currentColor, sourceInfo);
                
                // Add a custom log message for even more detail if there was an error
                if (payload.error) {
                    console.log("MMM-WallpaperColorExtractor: Extraction error: " + payload.error);
                }
            } else {
                this.debug("Received empty COLOR_EXTRACTED notification");
            }
        }
    },
    
    // Extract vibrant color from image
    processNewWallpaper: function(imagePath) {
        const self = this;
        
        this.debug("Processing new wallpaper:", imagePath);
        
        // Check if we should use a holiday color for today
        const holidayColor = this.getHolidayColorForToday();
        if (!this.config.disableHolidayColors && holidayColor) {
            this.debug("Using holiday color for today:", holidayColor);
            Log.info("MMM-WallpaperColorExtractor: Using holiday color: " + holidayColor);
            this.currentColor = holidayColor;
            this.updateCssVariable(this.currentColor, "holiday");
            return;
        }
        
        // If no image path provided, skip extraction
        if (!imagePath) {
            this.debug("No image path provided, skipping extraction");
            Log.warn("MMM-WallpaperColorExtractor: No image path provided");
            return;
        }
        
        // Use server-side extraction via node_helper
        this.debug("Sending EXTRACT_COLOR notification for:", imagePath);
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
        
        this.debug("Checking holiday colors for date:", month + "-" + day);
        
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
        Log.info("MMM-WallpaperColorExtractor: Updating CSS variable to: " + color);
        
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
