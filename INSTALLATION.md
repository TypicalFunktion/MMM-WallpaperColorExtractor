# Installation Guide for MMM-WallpaperColorExtractor

This guide will walk you through the process of installing and configuring the MMM-WallpaperColorExtractor module for your MagicMirror.

## Prerequisites

- MagicMirror² setup and running
- Node.js version 12 or higher
- A module that displays wallpapers (like MMM-Wallpaper)
- Your CSS should be using the CSS variable that this module will update (by default `--color-text-highlight`)

## Installation Steps

### 1. Clone the Repository

Navigate to your MagicMirror's `modules` folder:

```bash
cd ~/MagicMirror/modules/
```

Clone this repository:

```bash
git clone https://github.com/yourusername/MMM-WallpaperColorExtractor.git
```

### 2. Install Dependencies

Navigate to the module directory and install dependencies:

```bash
cd MMM-WallpaperColorExtractor
npm install
```

This will install the node-vibrant library which is used for color extraction.

### 3. Configure Your MagicMirror

Add the module configuration to your `config/config.js` file:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    position: "bottom_bar", // The position doesn't matter as this module is hidden
    config: {
        // See configuration options below
        colorExtractionMethod: "vibrant", // vibrant, muted, or random
        updateInterval: 10 * 1000, // 10 seconds - how often to check for color changes
        targetVariable: "--color-text-highlight" // CSS variable to update
    }
},
```

### 4. Customize Your CSS

Make sure your CSS is using the variable that will be updated. If you have a custom.css file, it should contain something like this:

```css
:root {
   --color-text-highlight: #90d5ff; /* This will be dynamically updated */
}

/* Then use the variable in your styles */
.calendar tr:before {
  background-color: var(--color-text-highlight);
}

.compliments {
  border-left: 4px solid var(--color-text-highlight);
  border-right: 4px solid var(--color-text-highlight);
}
```

### 5. Restart MagicMirror

Restart your MagicMirror to load the new module:

```bash
pm2 restart MagicMirror # if using PM2
```

Or stop and start it again manually if you're not using PM2.

## Configuration Options

Here's a detailed explanation of all configuration options:

| Option                   | Description                                                                                            | Default Value           |
|--------------------------|--------------------------------------------------------------------------------------------------------|-------------------------|
| `updateInterval`         | How often to check for color changes (in milliseconds)                                                | `10 * 1000` (10 seconds)|
| `animationSpeed`         | Speed of color transition animation (in milliseconds)                                                 | `2 * 1000` (2 seconds)  |
| `defaultColor`           | Default color to use if extraction fails                                                              | `"#90d5ff"`            |
| `minBrightness`          | Minimum brightness for extracted colors (0-1)                                                         | `0.5`                  |
| `maxBrightness`          | Maximum brightness for extracted colors (0-1)                                                         | `0.9`                  |
| `minSaturation`          | Minimum saturation for extracted colors (0-1)                                                         | `0.4`                  |
| `targetVariable`         | CSS variable to update with the extracted color                                                       | `"--color-text-highlight"` |
| `colorExtractionMethod`  | Method to extract colors: "vibrant", "muted", or "random"                                             | `"vibrant"`            |
| `disableHolidayColors`   | Set to `true` to disable special holiday colors                                                       | `false`                |
| `fallbackColors`         | Array of colors to randomly choose from if extraction fails                                           | Array of pastel colors  |
| `holidayColors`          | Object mapping "MM-DD" dates to colors for holidays                                                   | Various holiday colors  |
| `monthColors`            | Object mapping "MM" months to seasonal colors                                                         | October, December colors|

## Troubleshooting

### 1. Colors aren't changing

- Make sure your CSS is using the variable specified in `targetVariable`
- Check the browser console for any errors
- Verify that the wallpaper path is correctly detected in the server logs

### 2. Module can't find wallpaper directory

If the module is having trouble finding your wallpaper directory:

```javascript
config: {
    wallpaperDir: "/absolute/path/to/your/wallpaper/directory"
}
```

### 3. Module crashes on startup

- Check that you have installed all dependencies with `npm install`
- Make sure you have Node.js version 12 or higher
- Look for errors in the server logs

### 4. Colors are too bright/dark/saturated

Adjust the following settings to get colors more to your liking:

```javascript
config: {
    minBrightness: 0.4, // Lower for darker colors
    maxBrightness: 0.8, // Lower for less bright colors
    minSaturation: 0.3, // Lower for less saturated colors
}
```

## Support

If you need additional help, please open an issue on the GitHub repository.
