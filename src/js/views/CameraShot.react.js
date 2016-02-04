var React = require('react');
var Webcam = require('webcamjs');

var contents = ["initial", "taking-photo", "photo-taken"];

var CameraShot = React.createClass({
    render: function () {

        return (
            <div id="app-camera-view">
                <CameraPreview imageFunc={this.takePicture}/>

                <div id="camera-options">
                    <button className="btn btn-default" onClick={this.takePicture}><i className="fa fa-camera"></i>
                    </button>
                </div>
            </div>
        );
    },
    takePicture: function () {
        Webcam.snap(function (data_uri) {
            debugger;
            //todo wyslanie zdjecia do komponentu, ktory skomunikuje sie z serwerem,
            //todo funkcja zapisujaca fotki na serwerze
            //document.getElementById('my_result').innerHTML = '<img src="' + data_uri + '"/>';
        });
    }
});

var CameraPreview = React.createClass({
    componentWillUpdate: function () {
        if (this.props.imageFunc !== 'undefined') {
            this.props.imageFunc();
        }
    },
    componentDidMount: function () {
        Webcam.set({
            image_format: 'jpeg',
            jpeg_quality: 90,
            flip_horiz: true,
            dest_width: 640,
            dest_height: 480,
            maxWidth: 800
        });
        Webcam.attach( '#camera-canvas' );
    },
    componentWillUnmount: function () {
        Webcam.reset();
    },
    render: function () {
        return (
            <div className="camera-view-preview">
                <div id="camera-canvas"></div>
            </div>
        );
    }
});

module.exports = CameraShot;