import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from "prop-types";
import Translate from '../i18n/Translate.mixin';
import Toggle from 'material-ui/Toggle/Toggle';
import { config } from 'd2/lib/d2';

config.i18n.strings.add('external_access');

export default createReactClass({
    propTypes: {
        externalAccess: PropTypes.bool.isRequired,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    },

    mixins: [Translate],

    onToggle() {
        this.props.onChange(this.refs.toggle.isToggled());
    },

    render() {
        return (
            <Toggle
                ref="toggle"
                name="externalAccess"
                label={this.getTranslation('external_access')}
                checked={this.props.externalAccess}
                onToggle={this.onToggle}
                disabled={this.props.disabled}
            />
        );
    },
});
