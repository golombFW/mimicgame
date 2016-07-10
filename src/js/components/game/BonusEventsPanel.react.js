var React = require('react');
var _ = require('underscore');

var BonusEventsPanel = React.createClass({
    propTypes: {
        events: React.PropTypes.array
    },
    getDefaultProps: function () {
        return {
            events: null
        }
    },
    render: function () {
        var events = this.props.events;

        var eventsElements = [];
        if (events) {
            for (var num in events) {
                var event = events[num];
                var key = event.name + num;
                switch (event.name) {
                    case "correctAnswerAward":
                        break;
                    case "matchWinBonus":
                        eventsElements.push(
                            <div className="bonus-event" key={key}>
                                Premia za wygraną: <span className="bonus-event-value">{event.value}</span>
                            </div>
                        );
                        break;
                    case "matchLostBonus":
                        eventsElements.push(
                            <div className="bonus-event" key={key}>
                                Kara za przegraną: <span className="bonus-event-value">{event.value}</span>
                            </div>
                        );
                        break;
                    case "matchRandomBonus":
                        eventsElements.push(
                            <div className="bonus-event" key={key}>
                                Losowa premia za rozgrywkę! <span className="bonus-event-value">{event.value}</span>
                            </div>
                        );
                        break;
                    case "allCorrectAnswersAward":
                        eventsElements.push(
                            <div className="bonus-event" key={key}>
                                Brawo! Premia za wszystkie poprawne odpowiedzi: <span
                                className="bonus-event-value">{event.value}</span>
                            </div>
                        );
                        break;
                }
            }
        }
        if (0 < eventsElements.length) {
            return (
                <div id="bonus-events-panel">
                    {eventsElements}
                </div>
            );
        } else {
            return null;
        }
    }
});

module.exports = BonusEventsPanel;