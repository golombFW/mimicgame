var React = require('react');
var ReactDOM = require('react-dom');
var Parse = require('parse').Parse;
var Keys = require('./KeyConfig.js');

Parse.initialize(Keys.ParseAppId, Keys.ParseJavaScriptKey);

var LoginWrapper = require('./LoginWrapper.react.js');

ReactDOM.render(
    <LoginWrapper />,
    document.getElementById('app')
);