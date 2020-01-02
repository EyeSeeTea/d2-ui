import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from "prop-types";
import TextField from 'material-ui/TextField';


// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default createReactClass({
    propTypes: {
        value: PropTypes.string,
        multiLine: PropTypes.bool,
    },

    getInitialState() {
        return {
            value: this.props.value,
        };
    },

    UNSAFE_componentWillReceiveProps(props) {
        this.setState({ value: props.value });
    },

    _change(e) {
        this.setState({ value: e.target.value });
    },

    render() {
        const errorStyle = {
            lineHeight: this.props.multiLine ? '48px' : '12px',
            marginTop: this.props.multiLine ? -16 : 0,
        };

        return (
            <TextField errorStyle={errorStyle} {...this.props} value={this.state.value} onChange={this._change} />
        );
    },
});
