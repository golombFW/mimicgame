var React = require('react');
var Modal = require('react-bootstrap').Modal;

var About = React.createClass({
    propTypes: {
        display: React.PropTypes.bool,
        closeFunc: React.PropTypes.func
    },
    render: function () {
        return (
            <Modal show={this.props.display} onHide={this.props.closeFunc} aria-labelledby="ModalHeader"
                   onEntered={this.showFBLike}>
                <Modal.Header closeButton>
                    <Modal.Title id='ModalHeader'>O aplikacji</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Gra powstała jako część pracy magisterskiej na temat "Wykorzystanie grywalizacji w procesie
                        budowy bazy zdjęć ludzkich emocji", realizowanej na Politechnice Gdańskiej.
                        Zdjęcia które zebrane zostaną podczas rozgrywek nie będą publikowane i wykorzystywane poza grą
                        "Mimic Game" bez uprzedniego wyrażenia zgody przez gracza - autora zdjęcia.
                        Ponadto w celu ochrony prywatności, gracz może w "ustawieniach" zmienić widoczność wysyłanych
                        przez siebie zdjęć dla innych graczy.
                    </p>
                    <p>
                        Rozgrywka składa się z dwóch rodzajów 'tur'. Gracz ma za zadanie zgadywać emocje widoczne na
                        zdjęciach oraz wysyłać zdjęcia przedstawiające wybrane przez siebie emocje.
                    </p>
                    <div id="app-page-modal-like"></div>
                </Modal.Body>
            </Modal>
        );
    },
    showFBLike: function () {
        var s = '<div class="fb-page" data-href="https://www.facebook.com/mimicgameproject/" data-small-header="true" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true"><blockquote cite="https://www.facebook.com/mimicgameproject/" class="fb-xfbml-parse-ignore"><a href="https://www.facebook.com/mimicgameproject/">MimicGame project</a></blockquote></div>';
        var div = document.getElementById("app-page-modal-like");
        div.innerHTML = s;
        FB.XFBML.parse(document.getElementById('app-page-modal-like'));
    }
});

module.exports = About;