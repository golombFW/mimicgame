var React = require('react');

var About = require('./components/About.react.js');
var FullScreenButton = require('./components/FullScreenButton.react.js');

var AppFooter = React.createClass({
    getInitialState: function () {
        return {
            displayAbout: false
        }
    },
    componentDidMount: function () {
        var s = '<div class="fb-like" data-href="https://apps.facebook.com/mimicgame/" data-layout="button_count" data-action="like" data-size="small" data-show-faces="false" data-share="true"></div>';
        var div = document.getElementById('app-fb-like');
        div.innerHTML = s;
        FB.XFBML.parse(document.getElementById('app-fb-like'));
    },
    render: function () {
        var version = " ver" + process.env.APP_VERSION || "";
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
                <FullScreenButton />
            </div>
        );
    },
    showAbout: function () {
        this.setState({displayAbout: true});
    },
    closeAbout: function () {
        this.setState({displayAbout: false});
    },
});

module.exports = AppFooter;