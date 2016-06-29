var React = require('react');
var blobUtil = require('blob-util');

var MenuButton = require('../MenuButton.react.js');

var CameraLastPhoto = React.createClass({
    PropTypes: {
        photo: React.PropTypes.string,
        cancelPhoto: React.PropTypes.func.isRequired,
        uploadPhoto: React.PropTypes.func.isRequired
    },
    getDefaultProps: function () {
        return {
            photo: null
        };
    },

    render: function () {
        return (
            <div id="camera-preview-photo">
                <img src={blobUtil.createObjectURL(this.props.photo)} className="photo-area"/>
                <div className="photo-menu">
                    <MenuButton onClick={this.cancelPhoto}>Popraw zdjęcie</MenuButton>
                    <MenuButton onClick={this.sendPhoto}>Wyślij</MenuButton>
                </div>
            </div>
        );
    },
    cancelPhoto: function () {
        this.props.cancelPhoto();
    },
    sendPhoto: function () {
        this.props.uploadPhoto();
    }
});

module.exports = CameraLastPhoto;