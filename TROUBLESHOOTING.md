# MMM-WallpaperColorExtractor Troubleshooting Guide

## Black Screen Issues

If MagicMirror shows a black/blank screen after adding this module, follow these steps:

### 1. Immediate Fix
Remove the module from your `config.js` and restart MagicMirror to confirm the module is the cause.

### 2. Safe Configuration
Use this minimal configuration to test:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugDisplay: false,
        debugMode: false,
        preset: "default",
        updateInterval: 30000,
        defaultColor: "#90d5ff",
        targetVariable: "--color-text-highlight",
        enableMultipleVariables: false,
        enableWeatherColors: false,
        enableTimeColors: false
    }
}
```

### 3. Check Dependencies
Ensure all dependencies are installed:

```bash
cd ~/MagicMirror/modules/MMM-WallpaperColorExtractor
npm install
```

### 4. Check Node.js Version
This module requires Node.js >= 14:

```bash
node --version
```

### 5. Check Console Logs
Look for errors in the MagicMirror console or browser developer tools.

### 6. Test with Debug Mode
If the safe configuration works, try enabling debug mode:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugDisplay: true,
        debugMode: true,
        preset: "default",
        updateInterval: 30000,
        defaultColor: "#90d5ff"
    }
}
```

### 7. Common Issues

#### Missing Dependencies
- Ensure `node-vibrant` is installed
- Check if `sharp` is available (optional but recommended)

#### Configuration Errors
- Invalid color values in `holidayColors`
- Invalid CSS variable names
- Invalid preset names

#### Memory Issues
- Reduce `maxCacheSize` if experiencing memory problems
- Increase `updateInterval` to reduce processing frequency

### 8. Recovery Steps

1. **Remove module from config.js**
2. **Restart MagicMirror**
3. **Check console for errors**
4. **Reinstall dependencies if needed**
5. **Add module back with safe configuration**
6. **Gradually enable features**

### 9. Emergency Recovery

If MagicMirror won't start at all:

1. Stop MagicMirror
2. Edit `config.js` and comment out the MMM-WallpaperColorExtractor entry
3. Restart MagicMirror
4. Check logs for specific error messages

### 10. Getting Help

If issues persist:
1. Check the browser console for JavaScript errors
2. Check the terminal for Node.js errors
3. Enable debug mode and check the debug display
4. Report issues with specific error messages

## Version History

### v2.0.1 (Current)
- Fixed black screen issues
- Added comprehensive error handling
- Improved debug display safety
- Enhanced startup error recovery 