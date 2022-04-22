const desktopConfig = require('lighthouse/lighthouse-core/config/desktop-config.js');

const config = {
  ...desktopConfig,
  settings: {
    ...desktopConfig.settings,
    onlyCategories: ['performance'],
  },
};

module.exports = config;
