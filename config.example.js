// Configuration examples for MMM-WallpaperColorExtractor
// Copy the configuration you want to use to your config.js file

module.exports = [
    // Basic configuration with preset
    {
        module: "MMM-WallpaperColorExtractor",
        config: {
            preset: "vibrant"
        }
    },

    // Advanced configuration with multiple CSS variables
    {
        module: "MMM-WallpaperColorExtractor",
        config: {
            enableMultipleVariables: true,
            cssVariables: {
                primary: "--color-text-highlight",
                secondary: "--color-text-highlight-secondary",
                accent: "--color-accent",
                border: "--color-border"
            },
            colorExtractionMethod: "vibrant",
            updateInterval: 15000,
            debugMode: true
        }
    },

    // Performance-optimized configuration
    {
        module: "MMM-WallpaperColorExtractor",
        config: {
            preset: "performance",
            updateInterval: 30000,
            samplingRatio: 0.05,
            maxCacheSize: 25,
            debugMode: false
        }
    },

    // Accessibility-focused configuration
    {
        module: "MMM-WallpaperColorExtractor",
        config: {
            preset: "accessible",
            minContrastRatio: 7.0,
            colorExtractionMethod: "vibrant",
            enableWeatherColors: true,
            enableTimeColors: true
        }
    },

    // Custom holiday colors configuration
    {
        module: "MMM-WallpaperColorExtractor",
        config: {
            colorExtractionMethod: "vibrant",
            holidayColors: {
                "01-01": "#C0C0C0",  // New Year's Day
                "02-14": "#FF69B4",  // Valentine's Day
                "03-17": "#00FF00",  // St. Patrick's Day
                "07-04": "#3C3B6E",  // Independence Day
                "10-31": "#FF6700",  // Halloween
                "12-25": "#FF0000"   // Christmas
            },
            monthColors: {
                "10": "#FF6700", // October - Fall/Halloween theme
                "12": "#006400"  // December - Christmas theme
            }
        }
    },

    // Minimal configuration for testing
    {
        module: "MMM-WallpaperColorExtractor",
        config: {
            debugMode: true,
            updateInterval: 5000,
            targetVariable: "--color-text-highlight"
        }
    }
]; 