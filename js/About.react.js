var React = require('react');

var classNameModifier = '';
var About = React.createClass({
    render: function () {
        return (
            <div className={this.props.display !== true ? 'about hidden' : 'about'}>
                <span className="close-button glyphicon glyphicon-remove" onClick={this.props.closeFunc}></span>

                <h1>O aplikacji</h1>

                <p>
                    Uwaga, wszystkie zdjęcia zapisane podczas rozgrywki mogą
                    zostać wykorzystane do budowy bazy danych zdjęć ludzikch
                    emocji na Politechnice Gdańskiej. Korzystając z aplikacji
                    wyrażasz zgodę na takie wykorzystanie umieszczanych zdjęć.
                </p>
            </div>
        );
    }
});

module.exports = About;