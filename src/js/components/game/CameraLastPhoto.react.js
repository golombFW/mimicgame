var React = require('react');
var blobUtil = require('blob-util');

var CameraLastPhoto = React.createClass({
    PropTypes: {
        photo: React.PropTypes.string
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
            </div>
        );
    }
});

module.exports = CameraLastPhoto;