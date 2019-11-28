import React from 'react';
import PropTypes from "prop-types";
import CircularProgress from 'material-ui/CircularProgress';
import createReactClass from 'create-react-class';

export default createReactClass({
    propTypes: {
        style: PropTypes.object,
        size: PropTypes.number,
    },

    getDefaultProps() {
        return {
            style: {},
            size: 90,
        };
    },

    render() {
        const loadingStatusMask = {
            left: '45%',
            position: 'fixed',
            top: '45%',
        };

        return (
            <CircularProgress
                style={Object.assign(loadingStatusMask, this.props.style)}
            />
        );
    },
});
