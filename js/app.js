var React = require('react');
var ReactDOM = require('react-dom');
var Parse = require('parse').Parse;
var Keys = require('./KeyConfig.js');

var LoginWrapper = require('./LoginWrapper.react.js');

Parse.initialize(Keys.ParseAppId, Keys.ParseJavaScriptKey);

ReactDOM.render(
    <LoginWrapper />,
    document.getElementById('app')
);