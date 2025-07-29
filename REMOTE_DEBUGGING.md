# Remote Debugging Guide for Black Screen Issue

## Step 1: SSH into the remote machine
```bash
ssh user@192.168.1.200
```

## Step 2: Navigate to the module directory
```bash
cd ~/MagicMirror/modules/MMM-WallpaperColorExtractor
```

## Step 3: Run the diagnostic script
```bash
node debug-diagnostic.js
```

## Step 4: Check PM2 logs
```bash
pm2 logs MagicMirror --lines 100
```

## Step 5: Check browser console
1. Open the MagicMirror in a browser
2. Press F12 to open developer tools
3. Check the Console tab for JavaScript errors
4. Look for any "WCE" or "WallpaperColorExtractor" messages

## Step 6: Test with minimal configuration
Edit your `config.js` and replace the module entry with:

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

## Step 7: Test with minimal module
If the issue persists, temporarily rename the main file and use the minimal version:

```bash
# Backup the original
mv MMM-WallpaperColorExtractor.js MMM-WallpaperColorExtractor.js.backup

# Use the minimal version
cp MMM-WallpaperColorExtractor-minimal.js MMM-WallpaperColorExtractor.js
```

## Step 8: Restart MagicMirror
```bash
pm2 restart MagicMirror
```

## Step 9: Check if it works
- If the minimal version works, the issue is in the main module
- If it still doesn't work, the issue is elsewhere

## Step 10: Check MagicMirror config syntax
Look for syntax errors in your `config.js`:

```bash
# Check if config.js has syntax errors
node -c ~/MagicMirror/config/config.js
```

## Common Issues to Check:

### 1. Missing dependencies
```bash
npm install
```

### 2. Node.js version
```bash
node --version
# Should be >= 14
```

### 3. File permissions
```bash
ls -la MMM-WallpaperColorExtractor.js
```

### 4. MagicMirror version
```bash
cd ~/MagicMirror
git log --oneline -5
```

## Emergency Recovery:

If MagicMirror won't start at all:

1. **Stop PM2:**
```bash
pm2 stop MagicMirror
```

2. **Edit config.js and comment out the module:**
```bash
nano ~/MagicMirror/config/config.js
# Comment out the MMM-WallpaperColorExtractor entry
```

3. **Restart MagicMirror:**
```bash
pm2 start MagicMirror
```

4. **Check logs:**
```bash
pm2 logs MagicMirror
```

## What to report back:

1. Output from `debug-diagnostic.js`
2. Any errors in PM2 logs
3. Any errors in browser console
4. Whether the minimal configuration works
5. Your MagicMirror config.js (the module section only) 