const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyDisableDefaultRenames: true,
      },
    },
    argv
  );

  // Set the public path for GitHub Pages
  if (config.mode === 'production') {
    config.output.publicPath = '/Reality/';
  }

  return config;
};
