var React = require('react');
var Modal = require('react-bootstrap').Modal;

var browserStyle = function (url) {
    return {
        backgroundImage: "url('" + url + "')"
    }
};

var BrowserSupport = React.createClass({
    propTypes: {
        display: React.PropTypes.bool,
        closeFunc: React.PropTypes.func
    },
    render: function () {
        return (
            <Modal show={this.props.display} onHide={this.props.closeFunc} aria-labelledby="ModalHeader">
                <Modal.Header closeButton>
                    <Modal.Title id='ModalHeader'>Wspierane przeglądarki</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Niestety twoja przeglądarka internetowa nie jest oficjalnie wspierana przez tą grę. Mogą
                        wystąpić problemy z
                        jej działaniem. Autor gry nie planuje oficjalnego wsparcia twojej przeglądarki.
                    </p>
                    <p>
                        By w pełni cieszyć się grą zalecane jest uruchomienie jej na jednej z poniższych przeglądarek.
                    </p>

                    <div className="browser-icons">
                        <div className="Chrome"
                             style={browserStyle("https://lh4.googleusercontent.com/-gjxoCu8Fu3c/AAAAAAAAAAI/AAAAAAABOk0/fbBEf0VF2mU/s0-c-k-no-ns/photo.jpg")}></div>
                        <div className="Firefox"
                             style={browserStyle("https://upload.wikimedia.org/wikipedia/commons/7/76/Mozilla_Firefox_logo_2013.svg")}>
                        </div>
                        <div className="Safari"
                             style={browserStyle("https://upload.wikimedia.org/wikipedia/en/6/61/Apple_Safari.png")}></div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
});

module.exports = BrowserSupport;