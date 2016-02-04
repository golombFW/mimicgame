var React = require('react');
var Modal = require('react-bootstrap').Modal;

var About = React.createClass({
    render: function () {
        return (
            <Modal show={this.props.display} onHide={this.props.closeFunc} aria-labelledby="ModalHeader">
                <Modal.Header closeButton>
                    <Modal.Title id='ModalHeader'>O aplikacji</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Uwaga, wszystkie zdjęcia zapisane podczas rozgrywki mogą
                        zostać wykorzystane do budowy bazy danych zdjęć ludzkich
                        emocji na Politechnice Gdańskiej. Korzystając z aplikacji
                        wyrażasz zgodę na takie wykorzystanie umieszczanych zdjęć.
                    </p>
                </Modal.Body>
            </Modal>
        );
    }
});

module.exports = About;