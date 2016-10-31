import React from 'react';
import classes from 'classnames';
import LeftNav from 'material-ui/lib/left-nav';
import AppBar from 'material-ui/lib/app-bar';
import FlatButtonLabel from 'material-ui/lib/buttons/flat-button-label';


const DrawerPanel = React.createClass({

  // constructor(props) {
  //   super(props);
  //   this.state = {open: false};
  // },

  // handleToggle = () => this.setState({open: !this.state.open}),
  
    propTypes: {
        title: React.PropTypes.string,
    },  

    getInitialState() {
        return {
            open: false,
        };
    },

    render() {
        const classList = classes(
            {
                'drawer-embedded': this.props.embedded
            });

        return (
            <div>
                <LeftNav className={classList} width={this.props.width || '100%'} openSecondary={true} open={this.state.open} >
                    <AppBar title={this.props.title} />
                    {this.props.children}
                </LeftNav>
            </div>
        );
    }
});

export default DrawerPanel;