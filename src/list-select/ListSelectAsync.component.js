import React from 'react';
import PropTypes from "prop-types";
import createReactClass from 'create-react-class';
import ListSelect from './ListSelect.component';
import { Observable } from 'rx';
import log from 'loglevel';

const ListSelectAsync = createReactClass({
    propTypes: {
        source: PropTypes.instanceOf(Observable),
        onItemDoubleClick: PropTypes.func.isRequired,
        listStyle: PropTypes.object,
    },

    getInitialState() {
        return {
            listSource: [],
        };
    },

    UNSAFE_componentWillMount() {
        if (!this.props.source) {
            return;
        }

        this.disposable = this.props.source
            .subscribe(
                (listValues) => this.setState({ listSource: listValues }),
                (error) => log.error(error)
            );
    },

    componentWillUnmount() {
        this.disposable && this.disposable.dispose();
    },

    render() {
        return (
            <ListSelect {...this.props}
                        onItemDoubleClick={this.props.onItemDoubleClick}
                        source={this.state.listSource}
                        listStyle={this.props.listStyle}
                />
        );
    },
});

export default ListSelectAsync;
