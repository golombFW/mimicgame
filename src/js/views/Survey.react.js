var React = require('react');
var Parse = require('parse').Parse;
var StateMixin = require('reflux-state-mixin');

var UserStore = require('../stores/UserStore.js');
var DefaultGameViewContainer = require('../components/game/DefaultGameViewContainer.react.js');
var MenuButton = require('../components/MenuButton.react.js');

var AppStateActions = require('../actions/AppStateActions.js');
var AppState = require('../states/AppState.js');

var Survey = React.createClass({
    mixins: [StateMixin.connect(UserStore)],

    getInitialState: function () {
        return {formFilled: false}
    },
    componentDidMount: function () {
        window.addEventListener('message', this.handleMessage);
        setTimeout(function () {
            var qs, js, q, s, d = document, gi = d.getElementById, ce = d.createElement, gt = d.getElementsByTagName, id = 'typef_orm', b = 'https://s3-eu-west-1.amazonaws.com/share.typeform.com/';
            if (!gi.call(d, id)) {
                js = ce.call(d, 'script');
                js.id = id;
                js.src = b + 'share.js';
                q = gt.call(d, 'script')[0];
                q.parentNode.insertBefore(js, q)
            }
        }, 1000);
    },
    componentWillUnmount: function () {
        var typeformScript = document.getElementById("typef_orm");
        if (typeformScript) {
            typeformScript.remove();
        }

        window.removeEventListener('resize', this.handleMessage);
    },
    render: function () {
        var user = this.state.user;
        var survey = user.get("survey");
        var formUrl = survey ? survey.get("link") : "";
        var content;

        if (this.state.formFilled) {
            content = (
                <div id="survey-view">
                    <div className="thanks">Dziękuję za wypełnienie ankiety!</div>
                    <div className="options">
                        <MenuButton icon="fa fa-home" onClick={this.backToMenu}>Powrót do Menu</MenuButton>
                    </div>
                </div>
            );
        } else {
            content = (
                <div id="survey-view">
                    <div>Kliknij przycisk poniżej, by wypełnić ankietę. Zalecane jest, by wypełnić ją po rozegraniu
                        przynajmniej jednej rozgrywki!
                    </div>
                    <div><a className="typeform-share link btn btn-primary btn-lg" href={formUrl} data-mode="1"
                            target="_blank">Wypełnij Ankietę</a></div>
                    <div className="options">
                        <MenuButton icon="fa fa-home" onClick={this.backToMenu}>Powrót do Menu</MenuButton>
                    </div>
                </div>
            );
        }

        return (
            <DefaultGameViewContainer hideResult={true}>
                {content}
            </DefaultGameViewContainer>
        );
    },
    handleMessage: function (ev) {
        var orginalEvent = ev.originalEvent ? ev.originalEvent : ev;
        if ('form-submit' === orginalEvent.data) {
            console.log("Survey completed");
            this.setState({formFilled: true});
        }
    },
    backToMenu: function () {
        AppStateActions.changeState(AppState.MENU);
    }
});

module.exports = Survey;