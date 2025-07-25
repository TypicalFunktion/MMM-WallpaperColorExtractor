# MMM-WallpaperColorExtractor v2.0.0

A MagicMirror² module that dynamically extracts accent colors from your wallpaper to create a cohesive and adaptive theme for your mirror. This module works in conjunction with wallpaper modules like MMM-Background or MMM-Wallpaper to automatically update text colors based on the current background image.

## ✨ New in v2.0.0

- **🎨 Multiple CSS Variables Support** - Update multiple CSS variables simultaneously
- **⚡ Enhanced Performance** - LRU caching, image preprocessing, and optimized color extraction
- **🛡️ Robust Error Handling** - Retry logic, graceful degradation, and comprehensive error recovery
- **📊 Performance Monitoring** - Real-time metrics and performance tracking
- **🎛️ Configuration Presets** - Pre-configured settings for different use cases
- **🔧 Advanced Configuration** - Enhanced validation and flexible configuration options
- **🌐 Better Integration** - Improved compatibility with various wallpaper modules
- **📱 Accessibility Improvements** - WCAG 2.1 compliance and better contrast handling

## Features

- 🎨 **Automatic Color Extraction** - Extract vibrant, muted, or random colors from wallpapers
- 🌈 **WCAG 2.1 Compliant** - Ensure proper contrast ratios for better readability
- 🎅 **Holiday-Specific Colors** - Special colors for holidays and personal dates
- ⛈️ **Weather-Based Adaptation** - Colors that adapt to weather conditions
- 🌅 **Time-of-Day Changes** - Dynamic colors based on time of day
- 💾 **LRU Caching System** - Efficient memory management and fast color retrieval
- 🖼️ **Smart Image Processing** - Optimized image preprocessing for better performance
- 🎯 **Intelligent Color Selection** - Advanced algorithms for optimal color choice
- 🔄 **Retry Logic** - Automatic retry on failures with exponential backoff
- 📈 **Performance Metrics** - Monitor extraction times, cache hit rates, and errors

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

## Quick Start

### Basic Configuration
```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        preset: "vibrant" // Use a preset for quick setup
    }
}
```

### Advanced Configuration
```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        // Basic settings
        updateInterval: 10000,
        defaultColor: "#90d5ff",
        targetVariable: "--color-text-highlight",
        colorExtractionMethod: "vibrant",
        
        // Multiple CSS variables
        enableMultipleVariables: true,
        cssVariables: {
            primary: "--color-text-highlight",
            secondary: "--color-text-highlight-secondary",
            accent: "--color-accent",
            border: "--color-border"
        },
        
        // Performance settings
        preset: "performance",
        maxRetries: 3,
        retryDelay: 1000,
        
        // Error handling
        debugMode: false,
        timeout: 10000
    }
}
```

## Configuration Presets

### Available Presets

| Preset | Description | Best For |
|--------|-------------|----------|
| `vibrant` | Bright, saturated colors | High contrast displays |
| `subtle` | Muted, softer colors | Ambient lighting |
| `accessible` | High contrast, WCAG AAA compliant | Accessibility focus |
| `performance` | Optimized for speed | Resource-constrained systems |

### Using Presets
```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        preset: "vibrant" // Apply vibrant preset
    }
}
```

## Configuration Options

### Basic Settings
| Option | Description | Default | Type |
|--------|-------------|---------|------|
| `preset` | Configuration preset to use | "default" | String |
| `updateInterval` | How often to check for changes (ms) | 10000 | Number |
| `defaultColor` | Fallback color if extraction fails | "#90d5ff" | String (hex) |
| `targetVariable` | CSS variable to update | "--color-text-highlight" | String |
| `colorExtractionMethod` | Color selection method | "vibrant" | String |

### Multiple CSS Variables
| Option | Description | Default | Type |
|--------|-------------|---------|------|
| `enableMultipleVariables` | Enable multiple CSS variable updates | false | Boolean |
| `cssVariables` | Object mapping variable names to CSS variables | See defaults | Object |

### Performance Settings
| Option | Description | Default | Type |
|--------|-------------|---------|------|
| `maxRetries` | Maximum retry attempts for failed operations | 3 | Number |
| `retryDelay` | Delay between retries (ms) | 1000 | Number |
| `timeout` | Operation timeout (ms) | 10000 | Number |
| `samplingRatio` | Pixel sampling ratio for large images | 0.1 | Number |
| `maxCacheSize` | Maximum cached images | 50 | Number |
| `maxCacheAge` | Cache lifetime (ms) | 24 hours | Number |

### Color Selection Settings
| Option | Description | Default | Type |
|--------|-------------|---------|------|
| `minContrastRatio` | WCAG 2.1 contrast ratio | 4.5 | Number |
| `minBrightness` | Minimum brightness (0-1) | 0.5 | Number |
| `maxBrightness` | Maximum brightness (0-1) | 0.9 | Number |
| `minSaturation` | Minimum saturation (0-1) | 0.4 | Number |

### Feature Toggles
| Option | Description | Default | Type |
|--------|-------------|---------|------|
| `disableHolidayColors` | Disable holiday colors | false | Boolean |
| `enableWeatherColors` | Enable weather-based colors | true | Boolean |
| `enableTimeColors` | Enable time-of-day colors | true | Boolean |
| `debugMode` | Enable detailed logging | false | Boolean |

## Multiple CSS Variables

Enable multiple CSS variable updates for more comprehensive theming:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
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
```

## Error Handling & Recovery

The module includes comprehensive error handling:

- **Automatic Retry Logic** - Failed operations are retried with exponential backoff
- **Graceful Degradation** - Falls back to default colors when extraction fails
- **Error Recovery** - Automatic recovery from cache corruption and file system issues
- **Performance Monitoring** - Tracks errors and performance metrics

## Performance Optimization

### Caching
- **LRU Cache** - Efficient memory management with automatic cleanup
- **Image Preprocessing** - Optimized image processing for faster extraction
- **Smart Sampling** - Configurable pixel sampling for large images

### Monitoring
```javascript
// Enable performance monitoring
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugMode: true,
        preset: "performance"
    }
}
```

## Troubleshooting

### Common Issues

1. **Colors not updating:**
   - Check if your wallpaper module is properly configured
   - Enable `debugMode` for detailed logging
   - Verify the module has proper permissions to read images

2. **Performance issues:**
   - Use the `performance` preset
   - Reduce `updateInterval` value
   - Lower `samplingRatio` for large images
   - Adjust `maxCacheSize` based on available memory

3. **Memory usage:**
   - The module uses LRU caching to manage memory
   - Old cache entries are automatically cleaned up
   - Use `npm run clean` to manually clear cache

4. **Error recovery:**
   - The module automatically retries failed operations
   - Check logs for specific error messages
   - Use `debugMode: true` for detailed error information

### Debug Mode

Enable debug mode for detailed logging:
```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugMode: true
    }
}
```

### Performance Commands

```bash
# Clear cache
npm run clean

# View cache statistics
npm run cache-stats

# Start in development mode
npm run dev
```

## Compatibility

- **MagicMirror²**: `>= 2.0.0`
- **Node.js**: `>= 14`
- **Compatible with most wallpaper/background modules**:
  - MMM-Background
  - MMM-Wallpaper
  - Default background module

## API Reference

### Module Notifications

The module sends and receives various notifications:

#### Sent Notifications
- `COLOR_THEME_CHANGED` - When colors are updated
- `ERROR_OCCURRED` - When errors occur
- `PERFORMANCE_METRICS` - Performance statistics

#### Received Notifications
- `CURRENT_WEATHER` - Weather data for weather-based colors
- `MODULE_DOM_CREATED` - DOM ready notification

### CSS Variables

The module updates CSS custom properties that can be used throughout your MagicMirror interface:

```css
:root {
    --color-text-highlight: #90d5ff;
    --color-text-highlight-secondary: #7bc4f0;
    --color-accent: #5ba3d8;
    --color-border: #4a8bc7;
}
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Install dependencies: `npm install`
3. Enable debug mode for development
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the MagicMirror² community
- Built with [node-vibrant](https://github.com/Vibrant-Colors/node-vibrant)
- Color accessibility standards based on WCAG 2.1
- Performance optimizations inspired by modern web development practices

## Support

If you find this module helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting issues
- 💡 Contributing improvements
- 📢 Sharing with the MagicMirror community

## Changelog

### v2.0.0
- ✨ Added multiple CSS variables support
- ⚡ Enhanced performance with LRU caching
- 🛡️ Improved error handling and retry logic
- 📊 Added performance monitoring
- 🎛️ Added configuration presets
- 🔧 Enhanced configuration validation
- 🌐 Better integration with wallpaper modules
- 📱 Improved accessibility features

### v1.1.0
- Initial release with basic color extraction
- Holiday color support
- Weather-based color adaptation
- Basic caching system
