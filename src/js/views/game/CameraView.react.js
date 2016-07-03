var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var CameraPreview = require('../../components/game/CameraPreview.react.js');
var CameraLastPhoto = require('../../components/game/CameraLastPhoto.react.js');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;
var GameManagerActions = require('../../actions/GameManagerActions.js');
var MenuButton = require('../../components/MenuButton.react.js');

var CameraView = React.createClass({
    camera: null,
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
            isCameraDisplayed: false,
            lastPhoto: null
        }
    },
    componentDidMount: function () {
        //fixme workaround to react-dimensions get working on first render
        this.attachCameraComponent();
    },
    render: function () {
        var emotionTopic;
        if (this.props.data && this.props.data.selectedTopic) {
            emotionTopic = this.props.data.selectedTopic.value;
        }

        var cameraModule, options;
        if (this.state.lastPhoto) {
            cameraModule = (<CameraLastPhoto photo={this.state.lastPhoto} cancelPhoto={this.cancelPhoto}
                                             uploadPhoto={this.uploadPhoto}/>);
            options = [
                (
                    <MenuButton key="undo-photo" onClick={this.cancelPhoto} classes="btn-block" icon="fa fa-arrow-left">Popraw
                        zdjęcie</MenuButton>),
                (
                    <MenuButton key="upload-photo" onClick={this.uploadPhoto} classes="btn-block btn-success"
                                icon="fa fa-cloud-upload">Wyślij</MenuButton>
                )
            ];
        } else if (this.state.isCameraDisplayed) {
            cameraModule = (<CameraPreview topic={emotionTopic} ref="cameraPreview" initCameraFunc={this.initCamera}/>);
            options = (
                <MenuButton onClick={this.takePicture} icon="fa fa-camera" classes="btn-block">Zrób zdjęcie</MenuButton>
            );
        } else {
            cameraModule = (<span>Wczytywanie</span>);
        }

        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <div id="app-game-camera-view">
                    <div className="camera-view-description">
                        <div className="task-description">Kliknij przycisk z ikonką <i className="fa fa-camera"></i>, by
                            zacząć robić zdjęcie. Twoim zadaniem jest zrobienie zdjęcia jak najtrafniej wyrażającego
                            emocję <b>{emotionTopic}</b>.
                        </div>
                    </div>
                    <div className="camera-view-area">
                        <div className="camera-view-preview" ref="cameraPreviewContainer">
                            {cameraModule}
                        </div>
                        <div id="camera-options" className="">
                            {options}
                        </div>
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    },
    takePicture: function () {
        console.log("takePicture");
        var snapshot = this.camera.capture({mirror: true});
        snapshot.get_blob(function (data_uri) {
            this.setState({lastPhoto: data_uri});
        }.bind(this));
    },
    initCamera: function (camera) {
        this.camera = camera;
    },
    attachCameraComponent: function () {
        setTimeout(function () {
            this.setState({isCameraDisplayed: true});
        }.bind(this), 1000);
    },
    cancelPhoto: function () {
        console.log("User cancelled actual photo");
        this.setState({lastPhoto: null});
    },
    uploadPhoto: function () {
        console.log("Sending photo...");
        GameManagerActions.uploadPhoto(this.state.lastPhoto, this.props.data.selectedTopic);
    }
});

module.exports = CameraView;