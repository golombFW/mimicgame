var React = require('react');

var About = require('./components/About.react.js');
var FullScreenButton = require('./components/FullScreenButton.react.js');

var AppFooter = React.createClass({
    getInitialState: function () {
        return {
            displayAbout: false
        }
    },
    showAbout: function () {
        this.setState({displayAbout: true});
    },
    closeAbout: function () {
        this.setState({displayAbout: false});
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
                <span>{version}</span>

                <About closeFunc={this.closeAbout} display={this.state.displayAbout}/>
                <FullScreenButton />
            </div>
        );
    }
});

module.exports = AppFooter;