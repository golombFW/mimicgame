var React = require('react');
var Parse = require('parse').Parse;
var Keys = require('./KeyConfig.js');

var LoginWrapper = require('./LoginWrapper.react.js');

Parse.initialize(Keys.ParseAppId, Keys.ParseJavaScriptKey);

React.render(
    <LoginWrapper />,
    document.getElementById('app')
);