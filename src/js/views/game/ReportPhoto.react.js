var React = require('react');
var Parse = require('parse').Parse;

var LinkedStateMixin = require('react-addons-linked-state-mixin');
var cloudModel = require('../../../cloud/model.js');

var GameManagerActions = require('../../actions/GameManagerActions.js');
var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var MenuButton = require('../../components/MenuButton.react.js');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;

var reportReasonValues = [
    {key: cloudModel.reportReason.VIOLATION, value: "Nieodpowiednia treść"},
    {key: cloudModel.reportReason.INVALID, value: "Nie przedstawia emocji"},
    {key: cloudModel.reportReason.OTHER, value: "Inny"}
];

var ReportPhoto = React.createClass({
    mixins: [LinkedStateMixin],

    propTypes: {
        data: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            data: null
        }
    },
    getInitialState: function () {
        return {
            reason: cloudModel.reportReason.VIOLATION,
            error: null,
            success: null,
            loading: null
        };
    },
    componentWillMount: function () {
        if (!this.props.data || !this.props.data.reportedPhotoQuestion) {
            this.setState({
                error: {
                    msg: "Nieznany błąd"
                }
            });
        }
        else {
            var photoQuestion = this.props.data.reportedPhotoQuestion;
            var defaultParam = photoQuestion.get("default");
            if (defaultParam) {
                this.setState({
                    error: {
                        msg: "Nie możesz zgłosić tego zdjęcia."
                    }
                })
            }
        }
    },
    render: function () {
        var content, photoQuestion, imageUrl, sendButton;
        var reportReasonValueLink = this.linkState("reason");

        if (this.state.error) {
            content = (
                <div className="error">
                    <i className="fa fa-ban" aria-hidden="true"></i>
                    <div className="error-msg">
                        {this.state.error.msg}
                    </div>
                </div>
            );
        } else if (this.state.success) {
            content = (
                <div className="success">
                    <i className="fa fa-check" aria-hidden="true"></i>
                    <div className="success-msg">Przyjęto zgłoszenie!</div>
                </div>
            );
        } else if (this.state.loading) {
            content = (
                <LoadingBar color="dark" customText="Oczekiwanie na przyjęcie zgłoszenia..."/>
            );
        } else {
            photoQuestion = this.props.data.reportedPhotoQuestion;
            if (photoQuestion.get("photo")) {
                imageUrl = photoQuestion.get("photo")._url;
                if (imageUrl && imageUrl.indexOf("http://") > -1) {
                    imageUrl = imageUrl.replace("http://", "https://");
                }
            }
            sendButton = <MenuButton icon="fa fa-gavel" classes="btn-danger" onClick={this.submitReport}>Wyślij
                zgłoszenie</MenuButton>;

            content = (
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-8">
                        <div className="photo">
                            <img src={imageUrl}/>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-4">
                        <div className="form-group">
                            <label htmlFor="reportReasonSelect">Powód</label>
                            <select value={reportReasonValueLink.value} id="reportReasonSelect"
                                    ref="reportReasonSelect"
                                    onChange={this.handleReportReasonChange}>
                                {reportReasonValues.map(function (p) {
                                    return (
                                        <option key={p.key} value={p.key}>{p.value}</option>
                                    );
                                })}
                            </select><br/>
                            <p className="note">Wybierz powód zgłoszenia, odpowiednia klasyfikacja pomoże w szybszym
                                sprawdzeniu zgłoszenia!</p>
                        </div>

                    </div>
                </div>
            );
        }

        return (
            <DefaultGameViewContainer hideResult={true}>
                <div id="report-photo-question">
                    <div className="header">Zgłoś zdjęcie</div>
                    {content}
                    <div className="options">
                        <MenuButton icon="fa fa-arrow-left" onClick={this.backToGame}>Powrót do
                            rozgrywki</MenuButton>
                        {sendButton}
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    },
    handleReportReasonChange: function (event) {
        var privacyValue = event.target.value;
        var photoPrivacyValueLink = this.linkState("reason");

        photoPrivacyValueLink.requestChange(privacyValue);
    },
    backToGame: function () {
        GameManagerActions.nextTurn();
    },
    submitReport: function () {
        console.log("Sending report");
        this.setState({loading: true});
        Parse.Cloud.run('reportPhoto', {
            photoQuestionId: this.props.data.reportedPhotoQuestion.id,
            reason: this.state.reason
        }).then(function (data) {
            console.log("Photo question reported successfully");
            if (!data.isAccepted) {
                if (data.reason === cloudModel.reportResponseReason.INSPECTED) {
                    this.setState({
                        error: {
                            msg: "Zdjęcie zostało już wcześniej zgłoszone i przeszło weryfikację!"
                        }
                    });
                } else if (data.reason === cloudModel.reportResponseReason.DUPLICATE) {
                    this.setState({
                        error: {
                            msg: "Nie możesz kolejny raz zgłosić tego samego zdjęcia!"
                        }
                    });
                }
            } else {
                this.setState({success: true});
            }
        }.bind(this)).then(null, function (error) {
            console.error("Something happened: " + error.message);
        });
    }
});

module.exports = ReportPhoto;