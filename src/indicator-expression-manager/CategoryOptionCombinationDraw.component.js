import React from 'react';
import DrawerPanel from '../drawer-panel/DrawerPanel.component';
import { Observable } from 'rx';
import log from 'loglevel';

import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

//import d2Lib from 'd2/lib/d2';

//const CategoryOptionCombinationDraw = React.createClass({   
    
class CategoryOptionCombinationDraw extends React.Component {

    constructor(...args) {
        super(...args);

        this.state = {
            value : null
        };

        console.log(this);

        // this.addToSelection = addToSelection.bind(this);

        // this.handleSelectAll = this.handleSelectAll.bind(this);
        // this.handleDeselectAll = this.handleDeselectAll.bind(this);

        //this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
    }

     
    
    getInitialState = () => {
        return {
            value:null            
        };
    }
    
    handleChange = (event, index, value) => {
        this.setState({ value })      

    // const searchQueryRequest = d2Lib.getInstance()
    //     .then(d2 => d2.models[modelTypeToSearch])
    //     .then(modelType => modelType.filter().on(searchBy).ilike(valueToSearchFor))
    //     .then(modelTypeWithFilter => modelTypeWithFilter.list(options))
    //     .then(collection => collection.toArray())
    //     .catch(error => log.error(error));
    }    
    
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
    };

};

CategoryOptionCombinationDraw.propTypes= {
    dataElementOperandId: React.PropTypes.string,
};  

export default CategoryOptionCombinationDraw; 





