var React = require('react');
var Webcam = require('webcamjs');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var CameraPreview = require('../../components/game/CameraPreview.react.js');

var CameraView = React.createClass({
    propTypes: {
        gameInfo: React.PropTypes.object,
        data: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            gameInfo: null,
            data: null
        }
    },
    getInitialState: function () {
        return {
            isCameraDisplayed: false
        }
    },
    componentDidMount: function () {
        //fixme workaround to react-dimensions get working on first render
        this.attachCameraComponent();
    },
    render: function () {
        var cameraModule = this.state.isCameraDisplayed ?
            <CameraPreview imageFunc={this.takePicture} ref="cameraPreview"/> : <span>Wczytywanie</span>;

        var emotionTopic;
        if (this.props.data && this.props.data.selectedTopic) {
            emotionTopic = this.props.data.selectedTopic.value;
        }

        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <div id="app-game-camera-view">
                    <div className="camera-view-description">
                        <span>Temat: {emotionTopic}</span>
                        <p>Kliknij przycisk z ikonką <i className="fa fa-camera"></i>, by zacząć robić zdjęcie. Twoim
                            zadaniem jest zrobienie
                            zdjęcia jak najtrafniej wyrażającego emocję <b>{emotionTopic}</b>.</p>
                    </div>
                    <div className="camera-view-area row">
                        <div className="camera-view-preview col-sm-10" ref="cameraPreviewContainer">
                            {cameraModule}
                        </div>

                        <div id="camera-options" className="col-sm-2">
                            <a className="btn btn-default btn-block" type="button" onClick={this.takePicture}><i
                                className="fa fa-camera"></i> Zrób zdjęcie
                            </a>
                        </div>
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    },
    takePicture: function () {
        console.log("takePicture");
        Webcam.freeze();
        //function (data_uri) {
        //    debugger;
        //    //todo wyslanie zdjecia do komponentu, ktory skomunikuje sie z serwerem,
        //    //todo funkcja zapisujaca fotki na serwerze
        //    //document.getElementById('my_result').innerHTML = '<img src="' + data_uri + '"/>';
        //});
    },
    attachCameraComponent: function () {
        setTimeout(function () {
            this.setState({isCameraDisplayed: true});
        }.bind(this), 1000);
    }
});

module.exports = CameraView;