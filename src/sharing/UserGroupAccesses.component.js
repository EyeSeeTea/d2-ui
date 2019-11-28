import { default as React } from 'react';
import PropTypes from "prop-types";
import createReactClass from 'create-react-class';
import AccessMaskSwitches from '../sharing/AccessMaskSwitches.component';

export default createReactClass({
    propTypes: {
        userGroupAccesses: PropTypes.array,
        onChange: PropTypes.func.isRequired,
    },

    getDefaultProps() {
        return {
            userGroupAccesses: [],
            onChange: () => {},
        };
    },

    render() {
        const onChange = (currentItem) => { // eslint-ignore-line
            return (newAccessMask) => {
                const modifiedUserGroupAccesses = this.props.userGroupAccesses
                    .map(item => Object.assign({}, item))
                    .map(item => {
                        if (item.id === currentItem.id) {
                            item.access = newAccessMask;
                        }
                        return item;
                    });

                this.props.onChange(modifiedUserGroupAccesses);
            };
        };

        return (
            <div>
                {this.props.userGroupAccesses.map(item => {
                    return (
                        <AccessMaskSwitches
                            key={item.id}
                            accessMask={item.access}
                            name={item.name}
                            label={item.name}
                            onChange={onChange(item)}
                        />
                    );
                })}
            </div>
        );
    },
});
