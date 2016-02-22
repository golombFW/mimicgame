var React = require('react');
var Parse = require('parse').Parse;
var ParseReact = require('parse-react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;

var PhotoPrivacyValues = [
    {key: "ALL_USERS", value: "Wszyscy"}, {key: "FRIENDS", value: "Znajomi"}, {key: "NONE", value: "Nikt"}
];

var UserSettings = Parse.Object.extend("UserSettings");

var PrivacySettings = React.createClass({
    mixins: [ParseReact.Mixin, LinkedStateMixin],

    observe: function () {
        return {
            user: ParseReact.currentUser
        };
    },

    getInitialState: function () {
        return {
            settings: null,
            photoPrivacySetting: null
        };
    },
    componentDidMount: function () {
        var settings = new UserSettings({id: this.data.user.settings.objectId});
        settings.fetch().then(function (newSettings) {
                var photoPrivacy;
                if (null != newSettings) {
                    photoPrivacy = settings.get("photoPrivacy");
                }
                this.setState({
                    settings: newSettings,
                    photoPrivacySetting: photoPrivacy
                });

            }.bind(this),
            function (error) {
                console.error("Something goes wrong while getting privacy settings: " + error.message);
            })
    },
    render: function () {
        var settings = this.state.settings;

        var photoPrivacyValueLink = this.linkState("photoPrivacySetting");

        if (null == settings) {
            return <LoadingBar/>
        }
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Prywatność</h3>
                </div>
                <div className="panel-body">
                    <div className="form-group">
                        <label htmlFor="photoPrivacySelect">Kto może wyświetlać zdjęcia zrobione podczas twoich
                            rozgrywek? </label>
                        <select value={photoPrivacyValueLink.value} id="photoPrivacySelect" ref="photoPrivacySelect"
                                onChange={this.handlePhotoPrivacyChange}>
                            {PhotoPrivacyValues.map(function (p) {
                                return (
                                    <option key={p.key} value={p.key}>{p.value}</option>
                                );
                            })}
                        </select><br/>
                        <span>Uwaga, opcja będzie zastosowana tylko do rozgrywek, które dopiero zaczniesz. Zdjęcia zrobione w
                        poprzednich rozgrywkach, będą miały opcję ustawioną przez Ciebie w czasie ich rozpoczęcia.</span>
                    </div>
                </div>
            </div>
        );
    },
    handlePhotoPrivacyChange: function (event) {
        var privacyValue = event.target.value;
        var photoPrivacyValueLink = this.linkState("photoPrivacySetting");
        var previousValue = photoPrivacyValueLink.value;

        var settings = this.state.settings;
        settings.set("photoPrivacy", privacyValue);
        settings.save(null, {
            success: function (newSettings) {
                console.log("User settings saved, new settings: " + JSON.stringify(Parse.User.current().get("settings")));
            }, error: function (newSettings, error) {
                console.error("Something going wrong while setting user settings, error code: " + error.message);
                photoPrivacyValueLink.requestChange(previousValue);
            }
        });
        photoPrivacyValueLink.requestChange(privacyValue);
    }
});

module.exports = PrivacySettings;