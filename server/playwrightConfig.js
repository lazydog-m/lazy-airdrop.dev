// config.js
const path = require('path')

module.exports = {
  SCREEN_WIDTH: 1900,
  SCREEN_WIDTH_FULL: 1920,
  SCREEN_HEIGHT: 1040,
  PROFILE_SCRIPT_WIDTH: 533,
  PROFILE_SCRIPT_HEIGHT: 650,
  SCALE: 0.4,
  MAX_PROFILE: 12,

  EXTENSION_DIR: path.join(__dirname, './extensions'),
  PROFILE_DIR: path.join(__dirname, './profiles'),
  PROFILE_TEST_DIR: path.join(__dirname, './profiles/test'),
  SCRIPT_DIR: path.join(__dirname, './scripts'),
  TOOL_DIR: path.join(__dirname, './tools'),

  DELAY_3S: 3000,
  DELAY_OPEN_PROFILE: 50,
};
