var React = require('react');

var AdminPanelState = require('../../states/AdminPanelState.js');

var AdminMenu = React.createClass({
    propTypes: {
        currentView: React.PropTypes.string,
        changeViewFunc: React.PropTypes.func
    },
    contents: [
        [AdminPanelState.MIGRATION, "Migracja"],
        [AdminPanelState.INFO, "Dodaj zdjęcie"],
        [AdminPanelState.RESULTS, "Wyniki"]
    ],

    render: function () {
        var menuOptions = this.contents.map(
            function (value) {
                var classes = "";

                if (this.props.currentTab === value[0]) {
                    classes += "active";
                }

                return (
                    <li key={value[0]} className={classes}
                        role="presentation" onClick={this.props.changeViewFunc.bind(null, value[0])}>
                        <a href="#">{value[1]}</a>
                    </li>
                )
            }.bind(this)
        );
        return (
            <div id="adminpanel-menu" className="row">
                <ul className="nav nav-pills">
                    {menuOptions}
                </ul>
            </div>
        );
    }
});

module.exports = AdminMenu;