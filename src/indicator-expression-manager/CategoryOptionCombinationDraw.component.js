import React from 'react';
import DrawerPanel from '../drawer-panel/DrawerPanel.component';
import { Observable } from 'rx';
import log from 'loglevel';

import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

const CategoryOptionCombinationDraw = React.createClass({   
    
    propTypes: {
        dataElementOperandId: React.PropTypes.string,
    },   
    
    getInitialState() {
        return {
            value:null            
        };
    },       
    
    handleChange(event, index, value){
        this.setState({ value })        
    },    
    
    render() {        
        const contentStyle={
            padding:"0.5rem"
        }
        
        //TODO remove mock content
        const items = [
            <MenuItem key={1} value={1} primaryText="Never"/>,
            <MenuItem key={2} value={2} primaryText="Every Night"/>,
            <MenuItem key={3} value={3} primaryText="Weeknights"/>,
            <MenuItem key={4} value={4} primaryText="Weekends"/>,
            <MenuItem key={5} value={5} primaryText="Weekly"/>,
        ];        
        
        return (            
            <DrawerPanel embedded={true} width={'50%'} title={this.props.dataElementOperandId}>
                <SelectField
                    style={contentStyle}
                    value={this.state.value}
                    onChange={this.handleChange}
                    floatingLabelText="Floating Label Text"
                    >
                    {items}
                </SelectField>                
            </DrawerPanel>
        );
    },

});

export default CategoryOptionCombinationDraw; 





