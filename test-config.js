// Safe test configuration for MMM-WallpaperColorExtractor
// This configuration is designed to prevent black screen issues

module.exports = {
    module: "MMM-WallpaperColorExtractor",
    config: {
        // Disable debug display to prevent any visual interference
        debugDisplay: false,
        debugMode: false,
        
        // Use safe defaults
        preset: "default",
        updateInterval: 30000,  // 30 seconds - less frequent updates
        defaultColor: "#90d5ff", // Safe default color
        
        // Target CSS variable
        targetVariable: "--color-text-highlight",
        
        // Disable multiple variables for now
        enableMultipleVariables: false,
        
        // Conservative performance settings
        samplingRatio: 0.05,    // 5% sampling
        maxRetries: 2,          // Fewer retries
        retryDelay: 2000,       // Longer delay
        timeout: 15000,         // Longer timeout
        observeInterval: 10000,  // Less frequent DOM checking
        
        // Disable features that might cause issues
        enableWeatherColors: false,
        enableTimeColors: false,
        
        // Minimal holiday colors for testing
        holidayColors: {
            "12-25": "#FF0000" // Christmas red only
        },
        
        // Safe fallback colors
        fallbackColors: ["#90d5ff", "#FF9AA2"]
    }
}; 