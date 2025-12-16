const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');


const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.extraNodeModules = {
  ...require("node-libs-expo"),
}

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
})


module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });