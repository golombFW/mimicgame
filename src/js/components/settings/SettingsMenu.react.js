var React = require('react');

var SettingsState = require('../../states/SettingsState.js');

var SettingsMenu = React.createClass({
    propTypes: {
        currentTab: React.PropTypes.string,
        changeTabFunc: React.PropTypes.func
    },
    contents: [
        [SettingsState.USER, "Użytkownik", "fa fa-user"],
        [SettingsState.PRIVACY, "Prywatność", "fa fa-user-secret"]
    ],

    render: function () {
        var menuOptions = this.contents.map(
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
                    <a role="button" key={value[0]} className={className}
                       onClick={this.props.changeTabFunc.bind(null, value[0])}>
                        {icon} {value[1]}
                    </a>
                )
            }.bind(this)
        );

        return (
            <div id="settings-menu">
                {menuOptions}
            </div>
        );
    }
});

module.exports = SettingsMenu;