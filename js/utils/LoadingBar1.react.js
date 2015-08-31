var React = require('react');

var LoadingBar1 = React.createClass({
    render: function () {
        return (
            <div className="loading-bar1">
                <div className="spinner">
                    <div className="rect1"></div>
                    <div className="rect2"></div>
                    <div className="rect3"></div>
                    <div className="rect4"></div>
                    <div className="rect5"></div>
                </div>
                <div className="text">Trwa wczytywanie danych</div>
            </div>

        );
    }
});

module.exports = LoadingBar1;