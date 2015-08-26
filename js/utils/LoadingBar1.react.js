var React = require('react');

var LoadingBar1 = React.createClass({
    render: function () {
        return (
            <div className="LoadingBar1_container">
                <div className="LoadingBar1">
                    <div className="spinner">
                        <div className="rect1"></div>
                        <div className="rect2"></div>
                        <div className="rect3"></div>
                        <div className="rect4"></div>
                        <div className="rect5"></div>
                    </div>
                    <div className="text">Trwa wczytywanie</div>
                </div>
            </div>
        );
    }
});

module.exports = LoadingBar1;