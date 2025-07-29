/* Magic Mirror
 * Node Helper: MMM-WallpaperColorExtractor (Simple Version)
 *
 * By TypicalFunktion
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const path = require("path");
const fs = require("fs");
const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');
const Color = require('color');
const _ = require('lodash');

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting MMM-WallpaperColorExtractor node helper (simple version)");
        this.config = null;
    },

    socketNotificationReceived: function(notification, payload) {
        console.log(`MMM-WallpaperColorExtractor: Received notification: ${notification}`);
        
        if (notification === "SUBSCRIBE_WALLPAPER_CHANGES") {
            this.config = payload.config;
            console.log("MMM-WallpaperColorExtractor: Configuration received");
            
            // Send a test color immediately
            this.sendSocketNotification("COLOR_EXTRACTED", {
                success: true,
                color: this.config.defaultColor || "#90d5ff",
                source: "simple-fallback",
                method: "simple",
                palette: {}
            });
        }
    }
}); 