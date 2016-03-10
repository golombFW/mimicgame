var React = require('react');
var Webcam = require('webcamjs');
var Dimensions = require('react-dimensions');

var CameraPreview = React.createClass({
    propTypes: {
        imageFunc: React.PropTypes.func
    },
    getInitialState: function () {
        return ({minLength: 0});
    },
    componentWillUpdate: function () {
        //if ('undefined' !== typeof this.props.imageFunc) {
        //    this.props.imageFunc();
        //}
        Webcam.reset();
    },
    componentDidUpdate: function () {
        var min = this.minDimension();
        this.initializeWebcam(min);
        Webcam.attach('#camera-canvas');
    },
    componentDidMount: function () {
        var min = this.minDimension();
        this.initializeWebcam(min);
        Webcam.attach('#camera-canvas');
    },
    componentWillUnmount: function () {
        Webcam.reset();
    },
    render: function () {
        var min = this.minDimension();
        return (
            <div id="camera-preview-container">
                <div id="camera-canvas" ref="cameraCanvas"></div>
                <div id="camera-canvas-photo-area"
                     style={{width: min, height: min}}></div>
            </div>
        );
    },
    initializeWebcam: function (min) {
        Webcam.set({
            image_format: 'jpeg',
            jpeg_quality: 90,
            flip_horiz: true,
            width: this.props.containerWidth,
            height: this.props.containerHeight,
            dest_width: this.props.containerWidth,
            dest_height: this.props.containerHeight,
            crop_width: min,
            crop_height: min
        });
    },
    minDimension: function() {
        var min;
        if (this.props.containerHeight < this.props.containerWidth) {
            min = this.props.containerHeight;
        } else {
            min = this.props.containerWidth;
        }
        console.log("min length: " + min);
        return min;
    }
});

module.exports = Dimensions()(CameraPreview);