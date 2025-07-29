# MMM-WallpaperColorExtractor Troubleshooting Guide

## Blank Page Issues

### 1. Check if the module is loaded
- Look for a small "WCE Loaded" indicator in the top-left corner
- If you don't see this, the module isn't loading properly

### 2. Enable debug display
Add this to your config.js:
```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugDisplay: true,
        debugMode: true
    }
}
```

### 3. Check browser console
- Open browser developer tools (F12)
- Look for any JavaScript errors
- Check for "WCE" or "WallpaperColorExtractor" log messages

### 4. Verify module installation
```bash
cd ~/MagicMirror/modules/MMM-WallpaperColorExtractor
npm install
```

### 5. Check MagicMirror logs
```bash
pm2 logs MagicMirror
# or if not using PM2
npm start
```

## Common Issues

### Module not showing debug display
- Ensure `debugDisplay: true` is set in config
- Check that the module is properly added to your config.js
- Verify the CSS file is loading

### No colors being extracted
- Check if you have a wallpaper module installed (MMM-Wallpaper, MMM-Background)
- Verify the wallpaper module is working
- Enable `debugMode: true` for detailed logging

### Performance issues
- Reduce `updateInterval` value
- Lower `samplingRatio` for large images
- Use the "performance" preset

### CSS variables not updating
- Verify the CSS variable names are correct
- Check that your custom CSS is using the variables
- Ensure the module has proper permissions

## Test Configuration

Use this minimal configuration to test:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugDisplay: true,
        debugMode: true,
        preset: "vibrant",
        defaultColor: "#FF0000"
    }
}
```

## Debug Information

When `debugDisplay: true` is enabled, you should see:
- Current extracted color with visual indicator
- Color source (wallpaper, holiday, weather, etc.)
- Processing status and retry count
- Performance metrics
- Multiple colors (if enabled)
- Wallpaper file information

## Getting Help

1. Check the browser console for errors
2. Enable debug mode and check logs
3. Verify your configuration syntax
4. Test with the minimal configuration above
5. Check if other modules are interfering 