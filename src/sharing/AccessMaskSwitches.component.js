import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from "prop-types";
import Translate from '../i18n/Translate.mixin';
import Toggle from 'material-ui/Toggle/Toggle';
import ClearFix from 'material-ui/internal/ClearFix';
import { config } from 'd2/lib/d2';

config.i18n.strings.add('can_view');
config.i18n.strings.add('can_edit');

export default createReactClass({
    propTypes: {
        accessMask: PropTypes.oneOf([
            "--------",
            "--r-----",
            "---w----",
            "--rw----",
            "r-------",
            "r-r-----",
            "r--w----",
            "r-rw----",
            "rw------",
            "rwr-----",
            "rw-w----",
            "rwrw----",
        ]).isRequired,
        onChange: PropTypes.func.isRequired,
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        style: PropTypes.object,
        disabled: PropTypes.bool,
    },

    mixins: [Translate],

    getDefaultProps() {
        return {
            name: `${Date.now()}`, // TODO: Not strictly unique, but perhaps good enough.
            accessMask: '--------',
        };
    },

    getInitialState() {
        return {
            view: this.hasView(),
            edit: this.hasEdit(),
        };
    },

    onChange() {
        const viewChar = (this.state.view || this.state.edit) ? 'r' : '-';
        const editChar = this.state.edit ? 'w' : '-';
        const permission = viewChar + editChar;
        const accessMask = [permission, permission, "----"].join("");

        if (this.props.onChange) {
            this.props.onChange(accessMask);
        }
    },

    render() {
        const style = Object.assign({
            marginTop: '.5rem',
            paddingTop: '.5rem',
            borderTop: '1px solid #CCC',
        }, this.props.style);

        return (
            <div style={style} className="sharing--access-mask-switches">
                <div>{this.props.label}</div>
                <ClearFix>
                <Toggle
                    style={{
                        width: '40%',
                        float: 'left',
                    }}
                    ref="toggleView"
                    name={`${this.props.name}View`}
                    label={this.getTranslation('can_view')}
                    checked={this.hasView()}
                    onToggle={this.setView}
                    disabled={this.props.disabled || this.hasEdit()}
                    />
                <Toggle
                    style={{
                        width: '40%',
                        float: 'right',
                    }}
                    ref="toggleEdit"
                    name={`${this.props.name}Edit`}
                    label={this.getTranslation('can_edit')}
                    checked={this.hasEdit()}
                    onToggle={this.setEdit}
                    disabled={this.props.disabled}
                />
                </ClearFix>
            </div>
        );
    },

    hasView() {
        return /^r/.test(this.props.accessMask);
    },

    setView() {
        this.setState({
            view: !this.state.view,
        }, () => this.onChange());
    },

    hasEdit() {
        return /^rw/.test(this.props.accessMask);
    },

    setEdit() {
        this.setState({
            view: true,
            edit: !this.state.edit,
        }, () => this.onChange());
    },
});
