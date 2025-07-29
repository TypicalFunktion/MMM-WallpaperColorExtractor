/* Magic Mirror
 * Module: MMM-WallpaperColorExtractor (Minimal Version)
 *
 * By TypicalFunktion
 * MIT License
 */

Module.register("MMM-WallpaperColorExtractor", {
    // Minimal default config
    defaults: {
        debugDisplay: false,
        debugMode: false,
        updateInterval: 60000, // 1 minute
        defaultColor: "#90d5ff",
        targetVariable: "--color-text-highlight"
    },
    
    // Simple start method
    start: function() {
        Log.info("Starting MMM-WallpaperColorExtractor (minimal version)");
        
        try {
            this.currentColor = this.config.defaultColor;
            this.loaded = true;
            
            // Set initial CSS variable
            this.updateCssVariables(this.currentColor, "default");
            
            Log.info("MMM-WallpaperColorExtractor started successfully");
        } catch (error) {
            Log.error("MMM-WallpaperColorExtractor startup error:", error);
        }
    },
    
    // Simple DOM creation
    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.style.display = "none";
        wrapper.style.position = "absolute";
        wrapper.style.left = "-9999px";
        wrapper.style.top = "-9999px";
        wrapper.style.width = "1px";
        wrapper.style.height = "1px";
        wrapper.style.overflow = "hidden";
        wrapper.style.opacity = "0";
        wrapper.style.pointerEvents = "none";
        wrapper.innerHTML = "";
        return wrapper;
    },
    
    // Update CSS variables
    updateCssVariables: function(color, source) {
        try {
            document.documentElement.style.setProperty(this.config.targetVariable, color);
            Log.info(`Updated CSS variable ${this.config.targetVariable} to ${color} (source: ${source})`);
        } catch (error) {
            Log.error("Error updating CSS variable:", error);
        }
    },
    
    // Get styles
    getStyles: function() {
        return ["MMM-WallpaperColorExtractor.css"];
    },
    
    // Get scripts
    getScripts: function() {
        return [];
    }
}); 