var React = require('react');
var Dimensions = require('react-dimensions');

var CameraPreview = React.createClass({
    propTypes: {
        topic: React.PropTypes.string
    },
    getInitialState: function () {
        return ({minLength: 0});
    },
    componentWillUpdate: function () {
        // Webcam.reset();
    },
    componentDidUpdate: function () {
        this.initializeWebcam();
    },
    componentDidMount: function () {
        this.initializeWebcam();
    },
    componentWillUnmount: function () {
        // Webcam.reset();
    },
    render: function () {
        var topic;
        if (this.props.topic) {
            topic = (
                <div id="camera-canvas-topic">
                    <span className="topic-header"><b>Temat: </b></span>
                    <span className="content">{this.props.topic}</span>
                </div>
            );
        }
        return (
            <div id="camera-preview-container">
                <div id="camera-canvas" ref="cameraCanvas"></div>
                {topic}
            </div>
        );
    },
    initializeWebcam: function () {
        var containerWidth = this.props.containerWidth;
        var containerHeight = this.props.containerHeight;
        var computedHeight = containerWidth / (4 / 3);
        var computedWidth = containerHeight * (4 / 3);
        var width, height;
        if (computedHeight <= containerHeight) {
            width = containerWidth;
            height = computedHeight;
        } else {
            width = computedWidth;
            height = containerHeight;
        }
        var canvas = document.getElementById("camera-canvas");
        canvas.style.width = width;
        canvas.style.height = height;

        var camera = new JpegCamera("#camera-canvas", {
            shutter_ogg_url: "/resources/shutter.ogg",
            shutter_mp3_url: "/resources/shutter.mp3",
            swf_url: "/resources/jpeg_camera.swf",
            mirror: true
        });
        this.props.initCameraFunc(camera);
    }
});

module.exports = Dimensions()(CameraPreview);