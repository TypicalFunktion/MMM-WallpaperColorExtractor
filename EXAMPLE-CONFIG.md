# Example Configurations for MMM-WallpaperColorExtractor

Here are some example configurations to help you get started with the MMM-WallpaperColorExtractor module.

## Basic Configuration

This is the simplest configuration that uses all defaults:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar", // The position doesn't matter as this module is hidden
    config: {}
}
```

## Vibrant Colors Configuration

This configuration prioritizes vibrant, bright colors from your wallpaper:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar",
    config: {
        colorExtractionMethod: "vibrant",
        minBrightness: 0.6,
        minSaturation: 0.5,
        updateInterval: 5000,
        targetVariable: "--color-text-highlight"
    }
}
```

## Muted Colors Configuration

This configuration prioritizes more subtle, muted colors:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar",
    config: {
        colorExtractionMethod: "muted",
        minBrightness: 0.4,
        maxBrightness: 0.7,
        minSaturation: 0.3,
        updateInterval: 5000,
        targetVariable: "--color-text-highlight"
    }
}
```

## Random Good Colors Configuration

This configuration chooses a random color from the palette that meets the brightness and saturation criteria:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar",
    config: {
        colorExtractionMethod: "random",
        minBrightness: 0.5,
        maxBrightness: 0.9,
        minSaturation: 0.4,
        updateInterval: 5000,
        targetVariable: "--color-text-highlight",
        fallbackColors: [
            "#90d5ff", // Light Blue
            "#FF9AA2", // Light Red
            "#FFB347", // Light Orange
            "#B5EAD7", // Light Green
            "#C7CEEA"  // Light Purple
        ]
    }
}
```

## Disable Holiday Colors

If you don't want special colors on holidays and seasons:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar",
    config: {
        colorExtractionMethod: "vibrant",
        disableHolidayColors: true,
        targetVariable: "--color-text-highlight"
    }
}
```

## Custom Holiday Colors

You can define your own holiday colors:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar",
    config: {
        colorExtractionMethod: "vibrant",
        holidayColors: {
            "01-01": "#C0C0C0",  // New Year's Day (Silver)
            "02-14": "#FF69B4",  // Valentine's Day (Hot Pink)
            "03-17": "#00FF00",  // St. Patrick's Day (Green)
            "07-04": "#0000FF",  // Independence Day (Blue)
            "10-31": "#FFA500",  // Halloween (Orange)
            "11-11": "#B22222",  // Veterans Day (Firebrick)
            "12-25": "#FF0000",  // Christmas (Red)
            // Add your own custom dates
            "04-01": "#9932CC",  // April Fool's Day (Purple)
            "05-05": "#FFD700",  // Cinco de Mayo (Gold)
            "09-03": "#4682B4"   // Labor Day (Steel Blue)
        },
        monthColors: {
            "10": "#FF6700", // October - Fall/Halloween theme
            "12": "#006400", // December - Christmas theme
            // Add your own custom months
            "04": "#87CEEB", // April - Spring blue
            "07": "#FF4500"  // July - Summer orange
        }
    }
}
```

## Multiple CSS Variables

If you want to update multiple CSS variables with the same color:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar",
    config: {
        colorExtractionMethod: "vibrant",
        targetVariable: "--color-text-highlight", // Primary variable to update
        
        // In your config.js, add the following hook to update multiple variables
        // This will run whenever a color is extracted
        notificationReceived: function(notification, payload) {
            if (notification === "COLOR_THEME_CHANGED" && payload.variable === "--color-text-highlight") {
                // Update additional CSS variables with the same color
                document.documentElement.style.setProperty("--accent-color", payload.color);
                document.documentElement.style.setProperty("--border-color", payload.color);
            }
        }
    }
}
```

## Specific Wallpaper Directory

If the module has trouble finding your wallpaper directory automatically:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar",
    config: {
        colorExtractionMethod: "vibrant",
        wallpaperDir: "/home/pi/MagicMirror/modules/MMM-Wallpaper/cache" // Adjust path as needed
    }
}
```

## Different Color for Different Elements

You can use CSS to apply different variations of the extracted color to different elements:

```css
/* In your custom.css file */
:root {
    --color-text-highlight: #90d5ff; /* Base color - will be updated by module */
}

/* Slight variations for different elements */
.calendar tr:before {
    background-color: var(--color-text-highlight);
}

.compliments {
    border-left: 4px solid var(--color-text-highlight);
    border-right: 4px solid var(--color-text-highlight);
}

/* Lighter version (20% lighter) */
.module-header {
    color: color-mix(in srgb, var(--color-text-highlight) 80%, white);
}

/* Darker version (20% darker) */
.symbol {
    color: color-mix(in srgb, var(--color-text-highlight) 80%, black);
}

/* More transparent version */
.background-accent {
    background-color: color-mix(in srgb, var(--color-text-highlight) 30%, transparent);
}
```

## Performance Optimization

If you experience performance issues with color extraction:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar",
    config: {
        colorExtractionMethod: "vibrant",
        updateInterval: 30000, // Less frequent updates (30 seconds)
        samplingRatio: 0.05    // Sample only 5% of the pixels for large images
    }
}
```
