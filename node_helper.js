/* Magic Mirror
 * Node Helper: MMM-WallpaperColorExtractor
 *
 * By Claude & User
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const path = require("path");
const fs = require("fs");

module.exports = NodeHelper.create({
    // Initialize the helper
    start: function() {
        console.log("Starting node helper for: " + this.name);
        this.isListening = false;
    },
    
    // Socket notification received from module
    socketNotificationReceived: function(notification, payload) {
        if (notification === "SUBSCRIBE_WALLPAPER_CHANGES") {
            if (!this.isListening) {
                this.startListeningForWallpaperChanges();
                this.isListening = true;
            }
        }
    },
    
    // Start listening for wallpaper changes
    startListeningForWallpaperChanges: function() {
        console.log("MMM-WallpaperColorExtractor: Starting to listen for wallpaper changes");
        
        // Subscribe to wallpaper change notifications from MMM-Wallpaper
        this.subscribeToModuleNotifications("MMM-Wallpaper", (notification, payload) => {
            if (notification === "WALLPAPER_CHANGED") {
                console.log("MMM-WallpaperColorExtractor: Detected wallpaper change");
                this.processWallpaperChange(payload);
            }
        });
    },
    
    // Process wallpaper change
    processWallpaperChange: function(payload) {
        if (!payload || !payload.path) {
            console.log("MMM-WallpaperColorExtractor: Invalid wallpaper change payload");
            return;
        }
        
        // Send the wallpaper path to the module
        this.sendSocketNotification("WALLPAPER_CHANGED", {
            wallpaperPath: payload.path
        });
    },
    
    // Helper: Subscribe to notifications from another module
    subscribeToModuleNotifications: function(moduleName, callback) {
        const self = this;
        
        // This is a basic approach - in production, you might need 
        // to use a shared event bus or other mechanism if the MM2 doesn't
        // provide a direct way to subscribe to other modules' notifications
        
        // For now, we'll create a simple polling approach to check
        // if the MMM-Wallpaper module sends notifications
        
        // Note: In a real implementation, you would use the MM's internal
        // notification system rather than this polling mechanism
        
        console.log(`MMM-WallpaperColorExtractor: Setting up subscription to ${moduleName} notifications`);
        
        // This is a placeholder - in a real implementation, 
        // you would hook into the actual MM notification system
        setTimeout(() => {
            console.log(`MMM-WallpaperColorExtractor: Established connection to ${moduleName}`);
            
            // Send an initial notification to request the current wallpaper
            this.sendSocketNotification("WALLPAPER_REQUESTED", {});
        }, 10000);
    }
});
