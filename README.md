# MMM-WallpaperColorExtractor v2.0.0

A MagicMirror² module that dynamically extracts accent colors from your wallpaper to create a cohesive and adaptive theme for your mirror. This module works in conjunction with wallpaper modules like MMM-Background or MMM-Wallpaper to automatically update text colors based on the current background image.

## ✨ Features

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
- 🎛️ **Multiple CSS Variables** - Update multiple CSS variables simultaneously
- ⚡ **Configuration Presets** - Pre-configured settings for different use cases

## 🚀 Quick Start

### 1. Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/TypicalFunktion/MMM-WallpaperColorExtractor.git
cd MMM-WallpaperColorExtractor
npm install
```

### 2. Basic Configuration

Add to your `config/config.js`:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        preset: "vibrant" // Use a preset for quick setup
    }
}
```

### 3. CSS Setup

Add to your `css/custom.css`:

```css
:root {
    --color-text-highlight: #90d5ff; /* Will be dynamically updated */
}

/* Use the variable in your styles */
.calendar tr:before {
    background-color: var(--color-text-highlight);
}

.compliments {
    border-left: 4px solid var(--color-text-highlight);
    border-right: 4px solid var(--color-text-highlight);
}
```

### 4. Restart MagicMirror

```bash
pm2 restart MagicMirror # if using PM2
# or restart manually
```

## 📋 Configuration Options

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

## 🎛️ Configuration Presets

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

## 🔧 Advanced Configuration Examples

### Multiple CSS Variables

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

### Custom Holiday Colors

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        holidayColors: {
            "01-01": "#C0C0C0",  // New Year's Day
            "02-14": "#FF69B4",  // Valentine's Day
            "03-17": "#00FF00",  // St. Patrick's Day
            "07-04": "#3C3B6E",  // Independence Day
            "12-25": "#FF0000"   // Christmas
        }
    }
}
```

### Performance Optimization

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        preset: "performance",
        updateInterval: 30000,    // 30 seconds
        samplingRatio: 0.05,      // 5% sampling
        maxCacheSize: 25,         // Smaller cache
        debugMode: false          // Disable debug output
    }
}
```

## 🧪 Development & Testing

### Running Tests

```bash
# Run Jest tests
npm test

# Run development test
npm run test:dev

# Run linting
npm run lint

# Fix linting issues
npm run lint --fix
```

### Development Setup

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Clear cache
npm run clean

# View cache statistics
npm run cache-stats
```

## 🔍 Troubleshooting

### Common Issues

1. **Colors not updating:**
   - Check if your wallpaper module is properly configured
   - Enable `debugMode: true` for detailed logging
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

## 🔗 Compatibility

- **MagicMirror²**: `>= 2.0.0`
- **Node.js**: `>= 14`
- **Compatible with most wallpaper/background modules**:
  - MMM-Background
  - MMM-Wallpaper
  - Default background module

## 📊 Performance Monitoring

The module includes comprehensive performance monitoring:

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -am 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the MagicMirror² community
- Built with [node-vibrant](https://github.com/Vibrant-Colors/node-vibrant)
- Color accessibility standards based on WCAG 2.1
- Performance optimizations inspired by modern web development practices

## 📞 Support

If you find this module helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting issues
- 💡 Contributing improvements
- 📢 Sharing with the MagicMirror community

For support and questions:
- [GitHub Issues](https://github.com/TypicalFunktion/MMM-WallpaperColorExtractor/issues)
- [MagicMirror Forum](https://forum.magicmirror.builders/)

## 📝 Changelog

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
