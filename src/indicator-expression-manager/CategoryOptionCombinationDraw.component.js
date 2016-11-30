import React from 'react';
import DrawerPanel from '../drawer-panel/DrawerPanel.component';
import { Observable } from 'rx';
import log from 'loglevel';
import { config } from 'd2/lib/d2';
import Translate from '../i18n/Translate.mixin';

import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

config.i18n.strings.add('please_select_a_dataset');

export default React.createClass({   
    
    propTypes: {
        dataElementOperandId: React.PropTypes.string,
    },   

    mixins: [Translate],
    
    getInitialState() {
        return {
            value:null            
        };
    },       
    
    // handleChange(event, index, value){
    //     this.setState({ value })        
    // },    

    componentDidMount() {
        console.log("mounting")

    },

    componentWillReceiveProps(newProps) {
        console.log("updating")

        // if (this.props.dataElementOperandId != this.nextProps.dataElementOperandId){
            this.context.d2.models.dataElements.get(newProps.dataElementOperandId, { paging: false,fields: 'id, dataSets[id, categoryCombo[id,displayName, categories[id,displayName,categoryOptions[id,displayName]]]]' })
            .then(dataElement => dataElement.dataSets.toArray())
            .then(dataSets => 
            {
                const categoryComboItems = 
                    new Map(dataSets.map(dataSet => {
                        return [dataSet.categoryCombo.id, {
                            name: dataSet.categoryCombo.displayName,
                            categories: dataSet.categoryCombo.categories
                        }]
                    }));

                console.log(categoryComboItems)
                this.setState({categoryComboItems: categoryComboItems})
            });
        // }
        
    },

    _loadCategoryOptions(event, index, menuItem) {
        console.log("loading categories");
        console.log(menuItem)
        //this.state.categoryComboItems.get()
    },

    renderMenuItems() {
        const menuItems = []
        this.state.categoryComboItems.forEach(function(categoryComboItem, categoryComboItemId){
            menuItems.push(<MenuItem key={categoryComboItemId} value={categoryComboItemId} primaryText={categoryComboItem.name}/>);
        })
        return menuItems;
    },

    render() {        
        const contentStyle={
            padding:"0.5rem"
        }
        
        return (            
            <DrawerPanel embedded={true} width={'50%'} title={this.props.dataElementOperandId}>
                
                <SelectField
                    style={contentStyle}
                    value={this.state.value}
                    onChange={this._loadCategoryOptions}
                    floatingLabelText="Choose Category Combo"
                    // menuItems={this.renderMenuItems}
                    >
                    {this.state.categoryComboItems ? this.renderMenuItems(): null}

                </SelectField>                
            </DrawerPanel>
        );
    },

});