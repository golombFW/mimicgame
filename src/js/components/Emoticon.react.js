var React = require('react');
var _ = require('underscore');

var emotions = {
    "awesome": "AwesomeSmile.png",
    "trophy": "trophy.png",
    "angry": "emoticons_angry.png",
    "bad": "emoticons_bad.png",
    "disgusted": "emoticons_disgusted.png",
    "good": "emoticons_good.png",
    "happy": "emoticons_happy.png",
    "heypretty": "emoticons_heypretty.png",
    "killme": "emoticons_killme.png",
    "neutral": "emoticons_neutral.png",
    "sad": "emoticons_sad.png",
    "surprised": "emoticons_surprised.png",
    "ulala": "emoticons_ulala.png",
    "veryangry": "emoticons_veryangry.png",
    "verydisgusted": "emoticons_verydisgusted.png",
    "veryhappy": "emoticons_veryhappy.png",
    "verysad": "emoticons_verysad.png"
};
var Emoticon = React.createClass({
    propTypes: {
        emotion: React.PropTypes.oneOf(_.keys(emotions))
    },
    render: function () {
        var imagePath = '/resources/' + emotions[this.props.emotion];
        return (
            <div className="emoticon">
                <img src={imagePath}/>
            </div>
        );
    }
});

module.exports = Emoticon;