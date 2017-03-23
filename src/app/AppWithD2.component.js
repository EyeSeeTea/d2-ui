import React from 'react';
import log from 'loglevel';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default React.createClass({
    propTypes: {
        children: React.PropTypes.element,
        d2: React.PropTypes.shape({
            then: React.PropTypes.func.isRequired,
        }),
    },

    childContextTypes: {
        d2: React.PropTypes.object,
        muiTheme: React.PropTypes.object.isRequired
    },

    getChildContext() {
        return {
            d2: this.state.d2,
            muiTheme: this.props.muiTheme || getMuiTheme()
        };
    },

    getInitialState() {
        return {};
    },

    componentDidMount() {
        if (!this.props.d2) {
            return log.error('D2 is a required prop to <AppWithD2 />');
        }
        this.props.d2
            .then(d2 => this.setState({ d2 }))
            .catch(error => log.error(error));
    },

    render() {
        const getChildren = () => {
            if (!this.props.children) { return null; }
            return React.Children.map(this.props.children, child => {
                return React.cloneElement(child);
            });
        };

        return (
            <MuiThemeProvider>
                <div>
                    {getChildren()}
                </div>
            </MuiThemeProvider>
        );
    },
});
