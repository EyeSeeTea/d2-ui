import React from 'react';
import Checkbox from 'material-ui/Checkbox';


// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default React.createClass({
    propTypes: {
        onChange: React.PropTypes.func.isRequired,
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
