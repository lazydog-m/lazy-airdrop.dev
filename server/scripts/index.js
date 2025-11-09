const path = require('path')
const fs = require('fs');
const playwrightConfig = require('../playwrightConfig');

const indexPath = path.join(playwrightConfig.SCRIPT_DIR, 'index.json');

function modifieScript(scripts) {
  fs.writeFileSync(indexPath, JSON.stringify({ scripts: scripts }, null, 2), 'utf8');
}

function getScripts() {
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const scripts = indexData?.scripts || [];

  return scripts;
}

module.exports = {
  getScripts,
  modifieScript,
};
