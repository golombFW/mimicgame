var React = require('react');

var About = require('./components/About.react.js');
var BrowserSupport = require('./components/BrowserSupport.react.js');
var FullScreenButton = require('./components/FullScreenButton.react.js');
var BrowserDetection = require('react-browser-detection').default;


var AppFooter = React.createClass({
    getInitialState: function () {
        return {
            displayAbout: false,
            displaySupportedBrowsersModal: false
        }
    },
    componentDidMount: function () {
        var s = '<div class="fb-like" data-href="https://www.facebook.com/mimicgameproject" data-layout="button_count" data-action="like" data-size="small" data-show-faces="false" data-share="true"></div>';
        var div = document.getElementById('app-fb-like');
        div.innerHTML = s;
        if (window.FB) {
            FB.XFBML.parse(document.getElementById('app-fb-like'));
        }
    },
    render: function () {
        var version = " ver" + process.env.APP_VERSION || "";
        var self = this;
        var browserHandler = this.browserDetectionHandler();
        return (
            <div id="app-footer">
                <span className="footer-info">
                    <a href="https://github.com/golombFW/mimicgame" target="_blank">
                        <i className="fa fa-github"></i> Źródła
                    </a>
                </span>
                <span className="footer-info">
                    <a onClick={this.showAbout} href="#">O projekcie</a>
                </span>
                <span className="footer-info">Filip Gołębiewski 2016</span>
                <span className="footer-info">{version}</span>
                <span className="footer-info" id="app-fb-like"></span>

                <About closeFunc={this.closeAbout} display={this.state.displayAbout}/>
                <BrowserSupport closeFunc={this.closeSupport} display={this.state.displaySupportedBrowsersModal}/>
                <FullScreenButton />
                <BrowserDetection>
                    {browserHandler}
                </BrowserDetection>
            </div>
        );
    },
    showAbout: function () {
        this.setState({displayAbout: true});
    },
    closeAbout: function () {
        this.setState({displayAbout: false});
    },
    closeSupport: function () {
        this.setState({displaySupportedBrowsersModal: false});
    },
    browserDetectionHandler: function () {
        var self = this;
        return {
            ie: function () {
                return <div>
                    {self.setState({displaySupportedBrowsersModal: true})}
                </div>
            },
            edge: function () {
                return <div>
                    {self.setState({displaySupportedBrowsersModal: true})}
                </div>;
            },
            default: function (browser) {
                return null;
            }
        }
    }
});

module.exports = AppFooter;