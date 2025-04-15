# MMM-WallpaperColorExtractor

A [MagicMirror²](https://github.com/MichMich/MagicMirror) module that extracts vibrant colors from your wallpaper image and updates CSS variables to dynamically theme your mirror.

This module works great with modules that display wallpapers like MMM-Wallpaper.

## Features

- Extracts vibrant or muted colors from the current wallpaper
- Dynamically updates CSS variables to theme your mirror
- Special colors for holidays and seasons
- Fallback to attractive color palette if extraction fails
- Can be configured to use different color extraction methods

## Screenshots

![Example of changing highlight colors](https://example.com/placeholder-image.jpg)
*Example showing how the highlight color changes based on the wallpaper*

## Installation

1. Navigate to your MagicMirror's `modules` folder:
```bash
cd ~/MagicMirror/modules/
```

2. Clone this repository:
```bash
git clone https://github.com/yourusername/MMM-WallpaperColorExtractor.git
```

3. Install dependencies:
```bash
cd MMM-WallpaperColorExtractor
npm install
```

## Requirements

- MagicMirror² v2.8.0 or later
- A module that displays wallpapers (like MMM-Wallpaper)
- Your CSS should be using the variable that this module will update (by default `--color-text-highlight`)

## Using the module

Add the module configuration to your `config/config.js` file:

```javascript
modules: [
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
    // ... your other modules
]
```

## Configuration options

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
| `wallpaperDir`           | Manually specify the wallpaper directory (optional)                                                   | `""`                   |
| `samplingRatio`          | Portion of pixels to sample for large images (0-1)                                                    | `0.1`                  |
| `fallbackColors`         | Array of colors to randomly choose from if extraction fails                                           | Array of pastel colors  |
| `holidayColors`          | Object mapping "MM-DD" dates to colors for holidays                                                   | Various holiday colors  |
| `monthColors`            | Object mapping "MM" months to seasonal colors                                                         | October, December colors|

See [Example-Config.md](Example-Config.md) for more configuration examples.

## Customize your CSS

For this module to work effectively, your custom.css should be using CSS variables for colors. Here's an example of how to structure your CSS:

```css
:root {
   --color-text-dimmed: #90d5ff;
   --color-text-highlight: #90d5ff; /* This will be dynamically updated */
   
   /* Your other color variables */
   --color-text: #fff;
   --color-text-bright: #fff;
   /* etc. */
}

/* Then use the variables in your styles */
.calendar tr:before {
  background-color: var(--color-text-highlight);
}

.compliments {
  border-left: 4px solid var(--color-text-highlight);
  border-right: 4px solid var(--color-text-highlight);
}

/* etc. */
```

## Troubleshooting

- If colors aren't changing, make sure your CSS is using the variable specified in `targetVariable`
- Check the browser console and server logs for any errors
- Verify that the wallpaper path is correctly detected by checking the logs
- If the module can't find your wallpaper directory automatically, specify it manually in the config

See [INSTALLATION.md](INSTALLATION.md) for more detailed troubleshooting.

## Compatibility

This module works best with:
- MMM-Wallpaper
- Any modules that use CSS variables for styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License
