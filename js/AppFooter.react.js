var React = require('react');
var About = require('./About.react.js');

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
        return (
            <div className="app-footer">
                <span><a href="https://github.com/golombFW/mimicgame" target="_blank">
                    <i className="fa fa-github"></i> Get Sources </a></span>
                <span><a onClick={this.showAbout} href="#">O projekcie</a></span>
                <span>Filip Gołębiewski 2015</span>
                <About closeFunc={this.closeAbout} display={this.state.displayAbout}/>
            </div>
        );
    }
});

module.exports = AppFooter;