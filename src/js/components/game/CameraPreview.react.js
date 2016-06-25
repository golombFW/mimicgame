var React = require('react');
var Webcam = require('webcamjs');
var Dimensions = require('react-dimensions');

var CameraPreview = React.createClass({
    propTypes: {
        topic: React.PropTypes.string
    },
    getInitialState: function () {
        return ({minLength: 0});
    },
    componentWillUpdate: function () {
        Webcam.reset();
    },
    componentDidUpdate: function () {
        var min = this.minDimension();
        this.initializeWebcam(min);
        this.webcamAttach();
    },
    componentDidMount: function () {
        var min = this.minDimension();
        this.initializeWebcam(min);
        this.webcamAttach();
    },
    componentWillUnmount: function () {
        Webcam.reset();
    },
    render: function () {
        var min = this.minDimension();
        var topic;
        if (this.props.topic) {
            topic = (
                <div id="camera-canvas-topic">
                    <span className="topic-header"><b>Temat: </b></span>
                    <span className="content">{this.props.topic}</span>
                </div>
            );
        }

        var photoArea;
        if (Webcam.userMedia) {
            photoArea = (<div id="camera-canvas-photo-area"
                              style={{width: min, height: min}}></div>);
        }

        return (
            <div id="camera-preview-container">
                <div id="camera-canvas" ref="cameraCanvas"></div>
                {photoArea}
                {topic}
            </div>
        );
    },
    initializeWebcam: function (min) {
        Webcam.set({
            image_format: 'jpeg',
            jpeg_quality: 85,
            flip_horiz: true,
            width: this.props.containerWidth,
            height: this.props.containerHeight,
            dest_width: this.props.containerWidth,
            dest_height: this.props.containerHeight,
            crop_width: min,
            crop_height: min
        });
    },
    minDimension: function () {
        var min;
        if (this.props.containerHeight < this.props.containerWidth) {
            min = this.props.containerHeight;
        } else {
            min = this.props.containerWidth;
        }
        console.log("min length: " + min);
        return min;
    },
    webcamAttach: function () {
        Webcam.attach("#camera-canvas");
        if (!Webcam.userMedia) {
            var webcamObj = document.getElementById("webcam_movie_obj");
            var wmodeParam = webcamObj.querySelector("param[name='wmode']");
            wmodeParam.value = "direct";
        }
    }
});

module.exports = Dimensions()(CameraPreview);