var React = require('react');

var SummaryTurnPlank = React.createClass({
    propTypes: {
        turnNumber: React.PropTypes.number.isRequired,
        photoUrl1: React.PropTypes.string,
        photoUrl2: React.PropTypes.string
    },
    getDefaultProps: function () {
        return {
            turnNumber: 0,
            photoUrl1: null,
            photoUrl2: null
        }
    },
    render: function () {
        var photoUrl1 = this.props.photoUrl1;
        var photoUrl2 = this.props.photoUrl2;

        var photo1, photo2;
        if (photoUrl1) {
            if (photoUrl1.indexOf("http://") > -1) {
                photoUrl1 = photoUrl1.replace("http://", "https://");
            }
            photo1 = (
                <div className="photo photo1">
                    <img src={photoUrl1}/>
                </div>
            );
        }
        if (photoUrl2) {
            if (photoUrl2.indexOf("http://") > -1) {
                photoUrl2 = photoUrl2.replace("http://", "https://");
            }
            photo2 = (
                <div className="photo photo2">
                    <img src={photoUrl2}/>
                </div>
            );
        }

        return (
            <div className="summary-turn-plank">
                {photo1}
                <div className="turn-number">{this.props.turnNumber}</div>
                {photo2}
            </div>
        );
    }
});

module.exports = SummaryTurnPlank;