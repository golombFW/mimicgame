var React = require('react');

var AdminPanelState = require('../states/AdminPanelState.js');

var DefaultAppViewContainer = require('../components/DefaultAppViewContainer.react.js');
var AdminMenu = require('../components/admin/AdminMenu.react.js');
var RepairFiles = require('../components/admin/migration/RepairFiles.react.js');
var Results = require("../components/admin/Results.react.js");

var AdminPanel = React.createClass({
    contents: {},

    getInitialState: function () {
        this.contents[AdminPanelState.MIGRATION] = <RepairFiles/>;
        this.contents[AdminPanelState.RESULTS] = <Results/>;
        this.contents[AdminPanelState.INFO] = "Panel Admina";

        return {
            currentView: AdminPanelState.INFO
        }
    },
    render: function () {
        return (
            <DefaultAppViewContainer>
                <div id="app-adminpanel">
                    <AdminMenu currentView={this.state.currentView} changeViewFunc={this.changeView}/>
                    <div className="row">
                        {this.contents[this.state.currentView]}
                    </div>
                </div>
            </DefaultAppViewContainer>
        );
    },
    changeView: function (nextView) {
        this.setState({currentView: nextView});
    }
});

module.exports = AdminPanel;