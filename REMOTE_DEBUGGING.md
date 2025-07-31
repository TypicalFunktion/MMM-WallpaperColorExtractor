# Remote Debugging Guide for Black Screen Issue

## ✅ FIXED: node-vibrant Import Issue

The black screen issue was caused by an incorrect `node-vibrant` import. This has been fixed.

## Step 1: SSH into the remote machine
```bash
ssh user@192.168.1.200
```

## Step 2: Navigate to the module directory
```bash
cd ~/MagicMirror/modules/MMM-WallpaperColorExtractor
```

## Step 3: Test the fix
```bash
node test-vibrant.js
```
Expected output: "✓ Correct import method works"

## Step 4: Restart MagicMirror
```bash
pm2 restart MagicMirror
```

## Step 5: Check if it works
- The black screen should be gone
- MagicMirror should load normally
- Check PM2 logs: `pm2 logs MagicMirror --lines 50`

## Step 6: Test with debug display
If it works, try enabling debug display in your config.js:

```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugDisplay: true,
        debugMode: true,
        preset: "default",
        updateInterval: 30000,
        defaultColor: "#90d5ff",
        targetVariable: "--color-text-highlight"
    }
}
```

## Step 7: Check browser console
1. Open the MagicMirror in a browser
2. Press F12 to open developer tools
3. Check the Console tab for any errors
4. Look for "MMM-WallpaperColorExtractor" messages

## If issues persist:

### Option A: Use minimal configuration
```javascript
{
    module: "MMM-WallpaperColorExtractor",
    config: {
        debugDisplay: false,
        debugMode: false,
        updateInterval: 60000,
        defaultColor: "#90d5ff",
        targetVariable: "--color-text-highlight"
    }
}
```

### Option B: Use simple node helper
```bash
# Backup the current node helper
mv node_helper.js node_helper.js.backup

# Use the simple version
cp node_helper-simple.js node_helper.js

# Restart MagicMirror
pm2 restart MagicMirror
```

## What to report back:

1. Does MagicMirror start without black screen?
2. Any errors in PM2 logs?
3. Any errors in browser console?
4. Does the debug display work (if enabled)?

## Expected Results:

- ✅ No black screen
- ✅ Module loads successfully
- ✅ Default color is applied
- ✅ No crashes or errors
- ✅ Debug display works (if enabled) 