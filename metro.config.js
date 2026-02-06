const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite en web usa wa-sqlite.wasm; Metro debe tratar .wasm como asset para resolverlo
config.resolver.assetExts.push('wasm');

module.exports = config;
