const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for svg
config.resolver.assetExts.push('svg');

module.exports = config;
