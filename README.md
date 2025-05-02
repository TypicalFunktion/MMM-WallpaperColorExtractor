# MMM-WallpaperColorExtractor

A MagicMirror² module that dynamically extracts accent colors from your wallpaper to create a cohesive and adaptive theme for your mirror. This module works in conjunction with wallpaper modules like MMM-Background or MMM-Wallpaper to automatically update text colors based on the current background image.

## Features

- 🎨 Automatic color extraction from wallpapers
- 🌈 WCAG 2.1 compliant contrast ratios for better readability
- 🎅 Holiday-specific color themes
- ⛈️ Weather-based color adaptation
- 🌅 Time-of-day color changes
- 💾 Efficient image caching system
- 🖼️ Smart image preprocessing for better performance
- 🎯 Intelligent color selection based on visibility and aesthetics

## Installation

1. Navigate to your MagicMirror's modules directory:
```bash
cd ~/MagicMirror/modules
```

2. Clone this repository:
```bash
git clone https://github.com/TypicalFunktion/MMM-WallpaperColorExtractor.git
```

3. Install dependencies:
```bash
cd MMM-WallpaperColorExtractor
npm install
```

## Configuration

Add the following to your `config/config.js`:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        // Basic settings
        updateInterval: 10000,           // How often to check for changes (ms)
        defaultColor: "#90d5ff",         // Fallback color if extraction fails
        targetVariable: "--color-text-highlight", // CSS variable to update
        debugMode: false,                // Enable for detailed logging

        // Color selection settings
        minContrastRatio: 4.5,          // WCAG 2.1 AA standard
        minBrightness: 0.5,             // Minimum brightness (0-1)
        maxBrightness: 0.9,             // Maximum brightness (0-1)
        minSaturation: 0.4,             // Minimum saturation (0-1)
        colorExtractionMethod: "vibrant", // vibrant, muted, or random

        // Feature toggles
        disableHolidayColors: false,     // Set to true to disable holiday colors
        enableWeatherColors: true,       // Enable weather-based colors
        enableTimeColors: true,          // Enable time-of-day colors

        // Performance settings
        samplingRatio: 0.1,             // Sample 10% of pixels for large images
        observeInterval: 2000,           // DOM check interval (ms)
        maxCacheAge: 24 * 60 * 60 * 1000, // Cache lifetime (24 hours)
        maxCacheSize: 50,               // Maximum cached images
    }
}
```

### Configuration Options

| Option | Description | Default | Type |
|--------|-------------|---------|------|
| `updateInterval` | How often to check for changes | 10000 | Number (ms) |
| `defaultColor` | Fallback color if extraction fails | "#90d5ff" | String (hex) |
| `targetVariable` | CSS variable to update | "--color-text-highlight" | String |
| `minContrastRatio` | WCAG 2.1 contrast ratio | 4.5 | Number |
| `minBrightness` | Minimum brightness | 0.5 | Number (0-1) |
| `maxBrightness` | Maximum brightness | 0.9 | Number (0-1) |
| `minSaturation` | Minimum saturation | 0.4 | Number (0-1) |
| `colorExtractionMethod` | Color selection method | "vibrant" | String |
| `debugMode` | Enable detailed logging | false | Boolean |

## Color Priority Order

Colors are selected based on the following priority (configurable):
1. Holiday colors (if date matches)
2. Wallpaper extracted colors
3. Weather-based colors (if enabled)
4. Time-of-day colors (if enabled)
5. Fallback colors

## Holiday Colors

The module includes special colors for various holidays and special dates. You can customize these in the configuration. Example:

```javascript
holidayColors: {
    "12-25": "#FF0000", // Christmas (Red)
    "10-31": "#FF6700", // Halloween (Orange)
    "03-17": "#00FF00", // St. Patrick's Day (Green)
}
```

## Troubleshooting

### Common Issues

1. **Colors not updating:**
   - Check if your wallpaper module is properly configured
   - Enable `debugMode` for detailed logging
   - Verify the module has proper permissions to read images

2. **Performance issues:**
   - Reduce `updateInterval` value
   - Lower `samplingRatio` for large images
   - Adjust `maxCacheSize` based on available memory
   - Increase `observeInterval` if CPU usage is high

3. **Colors too bright/dark:**
   - Adjust `minBrightness` and `maxBrightness`
   - Modify `minSaturation` for color intensity
   - Change `minContrastRatio` for better readability

### Debug Mode

Enable debug mode in your config to see detailed logs:
```javascript
debugMode: true
```

## Compatibility

- MagicMirror²: `>= 2.0.0`
- Node.js: `>= 14`
- Compatible with most wallpaper/background modules:
  - MMM-Background
  - MMM-Wallpaper
  - Default background module

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the MagicMirror² community
- Built with [node-vibrant](https://github.com/Vibrant-Colors/node-vibrant)
- Color accessibility standards based on WCAG 2.1

## Support

If you find this module helpful, please consider:
- Starring the repository
- Reporting issues
- Contributing improvements
- Sharing with the MagicMirror community
