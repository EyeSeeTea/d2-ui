import React from 'react';
import LeftNav from 'material-ui/lib/left-nav';
import AppBar from 'material-ui/lib/app-bar';
import FlatButtonLabel from 'material-ui/lib/buttons/flat-button-label';


const DrawerPanel = React.createClass({

  // constructor(props) {
  //   super(props);
  //   this.state = {open: false};
  // },

  // handleToggle = () => this.setState({open: !this.state.open}),

  getInitialState() {
      return {
          open: false,
      };
  },

  render() {
    return (
      <div>
        <FlatButtonLabel
          label="Toggle Drawer"
          onTouchTap={this.handleToggle}
        />
        <LeftNav width={200} openSecondary={true} open={this.state.open} >
          <AppBar title="AppBar" />
        </LeftNav>
      </div>
    );
  }
});

export default DrawerPanel;