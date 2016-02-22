var React = require('react');
var Parse = require('parse').Parse;
var moment = require('moment');

var ActualGamesPanel = React.createClass({
    render: function () {
        var games = this.props.games;
        var user = Parse.User.current();

        var content = (
            <span className="">
                Aktualnie nie toczysz żadnej rozgrywki.
            </span>
        );
        if (null != games && 0 !== games.length) {
            games.sort(this.compareGames);
            content = games.map(function (s) {
                var p1 = s.get("player1");
                var p2 = s.get("player2");
                var opponent = p1.id !== user.id ? p1 : p2;

                return (
                    <div key={s.id} className="match-info">
                        <div clssName="opponent-info">Przeciwko {opponent.get("nick")}</div>
                        <button className="btn btn-default btn-xs" onClick={this.startGame.bind(this, s)}>Graj</button>
                    </div>
                );
            }.bind(this));
        }
        return (
            <div id="actual-games-panel">
                {content}
            </div>
        );
    },
    compareGames: function (a, b) {
        //sort by modifiedDate
        var dateA = moment(a.updatedAt);
        var dateB = moment(b.updatedAt);
        return dateB - dateA;
    },
    startGame: function (match) {
        alert('test');
    }
});

module.exports = ActualGamesPanel;