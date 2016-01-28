var env = require('./env.json');

var node_env = process.env.NODE_ENV || 'development';
var KeyConfig = env[node_env];

module.exports = KeyConfig;
