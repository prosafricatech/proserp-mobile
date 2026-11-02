// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// exceljs' default browser build (dist/exceljs.min.js) bundles core-js polyfills, including
// a Promise replacement with its own unhandled-rejection tracking. On Hermes that polyfill
// replaces the native Promise and fights React Native's rejection tracking, which ended in
// "RangeError: Maximum call stack size exceeded" hundreds of times at startup.
// The "bare" build is the same library without those polyfills.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'exceljs') {
    return context.resolveRequest(context, 'exceljs/dist/exceljs.bare.min.js', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
