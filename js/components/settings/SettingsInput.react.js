var React = require('react/addons');

var SettingsInput = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function () {
        return {
            value: this.props.children,
            isModified: false
        }
    },
    render: function () {
        var value = this.state.value;

        if (this.state.isModified) {
            return (
                <div className="input-group">
                    <input type="text" className="form-control" id={this.props.id} placeholder={this.props.placeholder}
                           valueLink={this.linkState('value')}/>
                <span className="input-group-btn">
                    <button className="btn btn-success" type="button" onClick={this.saveValue}>
                        <i className="fa fa-check"></i> Zapisz
                    </button>
                    <button className="btn btn-danger" type="button" onClick={this.abortEdit}>
                        <i className="fa fa-ban"></i> Anuluj
                    </button>
                </span>
                </div>
            );
        }
        var labelId = this.props.id + "-label";
        return (
            <div>
                <span id={labelId} ref={this.props.id}>{this.props.children}</span>
                <button className="btn btn-default btn-xs" type="button" onClick={this.editValue}>
                    <i className="fa fa-pencil"></i> Zmień
                </button>

            </div>
        );
    },
    resetValue: function () {
        this.setState({value: this.props.children});
    },
    editValue: function () {
        this.resetValue();
        this.setState({isModified: true});
    },
    abortEdit: function () {
        this.setState({isModified: false});
    },
    saveValue: function () {
        this.props.onSave(this.state.value);
        this.setState({isModified: false});
    }
});

module.exports = SettingsInput;