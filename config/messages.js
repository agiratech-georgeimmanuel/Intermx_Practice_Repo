const yaml = require('js-yaml');
const fs = require('fs');

const msg = yaml.load(fs.readFileSync(__dirname + '/messages.yaml', 'utf8'));

module.exports = {
  success: msg.success, error: msg.error
};