// Example configuration for MMM-WallpaperColorExtractor
// Copy this to your config.js and modify as needed

module.exports = {
    module: "MMM-WallpaperColorExtractor",
    config: {
        // Enable debug display to show color information on screen
        debugDisplay: true,  // Set to true to show debug info on screen
        debugMode: true,     // Set to true for console logging
        
        // Basic settings
        preset: "vibrant",   // "vibrant", "subtle", "accessible", "performance"
        updateInterval: 10000,
        defaultColor: "#90d5ff",
        
        // Target CSS variable to update
        targetVariable: "--color-text-highlight",
        
        // Multiple CSS variables (optional)
        enableMultipleVariables: false,
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
        timeout: 10000
    }
};

// Alternative configuration with multiple variables enabled
/*
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugDisplay: true,
        debugMode: true,
        preset: "vibrant",
        enableMultipleVariables: true,
        cssVariables: {
            primary: "--color-text-highlight",
            secondary: "--color-text-highlight-secondary",
            accent: "--color-accent",
            border: "--color-border",
            background: "--color-background-accent"
        }
    }
}
*/ 