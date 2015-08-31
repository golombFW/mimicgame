var React = require('react');
var Parse = require('parse').Parse;
var keys = require('./KeyConfig.js');
// Insert your app's keys here:
Parse.initialize(keys.ParseAppId, keys.ParseJavaScriptKey);

var LoginWrapper = require('./LoginWrapper.react.js');
React.render(
    <LoginWrapper />,
    document.getElementById('app')
);