import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from "prop-types";
import Checkbox from 'material-ui/Checkbox';


// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default createReactClass({
    propTypes: {
        onChange: PropTypes.func.isRequired,
    },

    render() {
        const {errorStyle, errorText, ...propsForCheckbox} = this.props;

        return (
            <div style={{ marginTop: 12, marginBottom: 12 }}>
                <Checkbox onCheck={this.props.onChange} {...propsForCheckbox} />
            </div>
        );
    },
});
