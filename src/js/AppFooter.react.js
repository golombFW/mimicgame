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
        var version = "Wersja " + process.env.APP_VERSION || "";
        return (
            <div className="app-footer">
                <span>
                    <a href="https://github.com/golombFW/mimicgame" target="_blank">
                        <i className="fa fa-github"></i> Źródła
                    </a>
                </span>
                <span>
                    <a onClick={this.showAbout} href="#">O projekcie</a>
                </span>
                <span>Filip Gołębiewski 2015-2016</span>
                <About closeFunc={this.closeAbout} display={this.state.displayAbout}/>
                <br/>
                {version}
                <FullScreenButton />
            </div>
        );
    }
});

module.exports = AppFooter;