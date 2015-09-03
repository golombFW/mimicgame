var React = require('react');
var Modal = require('react-bootstrap-modal');

var classNameModifier = '';
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
                        zostać wykorzystane do budowy bazy danych zdjęć ludzikch
                        emocji na Politechnice Gdańskiej. Korzystając z aplikacji
                        wyrażasz zgodę na takie wykorzystanie umieszczanych zdjęć.
                    </p>
                </Modal.Body>
            </Modal>
        );
    }
});

module.exports = About;