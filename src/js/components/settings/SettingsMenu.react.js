var React = require('react');

var SettingsState = require('../../states/SettingsState.js');


var SettingsMenu = React.createClass({
    contents: [
        [SettingsState.USER, "Użytkownik", "fa fa-user"],
        [SettingsState.PRIVACY, "Prywatność", "fa fa-user-secret"]
    ],

    render: function () {
        return (
            <div id="settings-menu">
                {
                    this.contents.map(
                        function (value) {
                            var className = "btn btn-lg btn-block ";

                            if (this.props.currentTab === value[0]) {
                                className += "btn-primary";
                            } else {
                                className += "btn-default";
                            }

                            var icon = null;
                            if (value[2]) {
                                icon = <i className={value[2]}></i>
                            }

                            return (
                                <button type="button" key={value[0]} className={className}
                                        onClick={this.props.changeTabFunc.bind(null, value[0])}>
                                    {icon} {value[1]}
                                </button>
                            )
                        }.bind(this)
                    )
                }
            </div>
        );
    }
});

module.exports = SettingsMenu;