import { default as React } from 'react';
import createReactClass from 'create-react-class';
import PropTypes from "prop-types";
import Translate from '../i18n/Translate.mixin';
import { config } from 'd2/lib/d2';

config.i18n.strings.add('created_by');

export default createReactClass({
    propTypes: {
        user: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }).isRequired,
    },

    mixins: [Translate],

    getDefaultProps() {
        return {
            user: {},
        };
    },

    render() {
        let nameToRender = '';
        if (this.props.user && this.props.user.name) {
            nameToRender = this.props.user.name;
        }

        const createdByText = `${this.getTranslation('created_by')}: ${nameToRender}`;

        return (
            <div>{createdByText}</div>
        );
    },
});
