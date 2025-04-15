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
    
    // Override start method
    start: function() {
        Log.info("Starting module: " + this.name);
        
        this.currentColor = this.config.defaultColor;
        this.loaded = false;
        
        // Set the initial CSS variable
        this.updateCssVariable(this.currentColor);
        
        // Subscribe to wallpaper change notifications
        this.sendSocketNotification("SUBSCRIBE_WALLPAPER_CHANGES", {
            config: this.config
        });
        
        // Schedule the first update
        this.scheduleUpdate();
    },
    
    // Schedule next update
    scheduleUpdate: function() {
        var self = this;
        setInterval(function() {
            self.updateColor();
        }, this.config.updateInterval);
    },
    
    // Update the color based on current method
    updateColor: function() {
        // This can be used for periodic checks or refreshes
        const holidayColor = this.getHolidayColorForToday();
        if (!this.config.disableHolidayColors && holidayColor) {
            Log.info("MMM-WallpaperColorExtractor: Using holiday color: " + holidayColor);
            this.currentColor = holidayColor;
            this.updateCssVariable(this.currentColor);
        }
    },
    
    // Socket notification received
    socketNotificationReceived: function(notification, payload) {
        if (notification === "WALLPAPER_CHANGED") {
            Log.info("MMM-WallpaperColorExtractor: Received wallpaper change notification");
            this.processNewWallpaper(payload.wallpaperPath);
        } 
        else if (notification === "COLOR_EXTRACTED") {
            if (payload && payload.color) {
                Log.info("MMM-WallpaperColorExtractor: Received extracted color: " + payload.color);
                this.currentColor = payload.color;
                this.updateCssVariable(this.currentColor);
            }
        }
    },
    
    // Extract vibrant color from image
    processNewWallpaper: function(imagePath) {
        const self = this;
        
        // Check if we should use a holiday color for today
        const holidayColor = this.getHolidayColorForToday();
        if (!this.config.disableHolidayColors && holidayColor) {
            Log.info("MMM-WallpaperColorExtractor: Using holiday color: " + holidayColor);
            this.currentColor = holidayColor;
            this.updateCssVariable(this.currentColor);
            return;
        }
        
        // If no image path provided, skip extraction
        if (!imagePath) {
            Log.warn("MMM-WallpaperColorExtractor: No image path provided");
            return;
        }
        
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
        
        // Check for specific day holiday color
        const dateKey = month + "-" + day;
        if (this.config.holidayColors[dateKey]) {
            return this.config.holidayColors[dateKey];
        }
        
        // Check for month-based seasonal color
        if (this.config.monthColors[month]) {
            return this.config.monthColors[month];
        }
        
        return null;
    },
    
    // Update CSS variable with new color
    updateCssVariable: function(color) {
        if (!color) return;
        
        Log.info("MMM-WallpaperColorExtractor: Updating CSS variable to: " + color);
        document.documentElement.style.setProperty(this.config.targetVariable, color);
        
        // Broadcast the color change to other modules
        this.sendNotification("COLOR_THEME_CHANGED", { 
            variable: this.config.targetVariable,
            color: color 
        });
    },
    
    // Override DOM generator
    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.style.display = "none"; // This module doesn't need visual elements
        return wrapper;
    },
});
