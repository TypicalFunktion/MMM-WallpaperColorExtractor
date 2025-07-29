// Test configuration for MMM-WallpaperColorExtractor
// This will force the debug display to show even without a wallpaper

module.exports = {
    module: "MMM-WallpaperColorExtractor",
    config: {
        // Force debug display to show
        debugDisplay: true,
        debugMode: true,
        
        // Basic settings
        preset: "vibrant",
        updateInterval: 5000,  // Check every 5 seconds
        defaultColor: "#FF0000", // Red for testing
        
        // Target CSS variable
        targetVariable: "--color-text-highlight",
        
        // Force some test data
        enableMultipleVariables: true,
        cssVariables: {
            primary: "--color-text-highlight",
            secondary: "--color-text-highlight-secondary",
            accent: "--color-accent",
            border: "--color-border"
        },
        
        // Performance settings
        samplingRatio: 0.1,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 10000,
        
        // Test holiday color
        holidayColors: {
            "12-25": "#00FF00" // Christmas green
        }
    }
}; 