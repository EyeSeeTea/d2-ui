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
        dataElementOperandId: React.PropTypes.string
    },   

    mixins: [Translate],
    
    getInitialState() {
        return {
            value: null         
        };
    },       
    
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
        this.setState({ categoryComboId: menuItem })   
        var categoryCombo = this.state.categoryComboItems.get(menuItem)
        this.setState({categories: categoryCombo.categories})
        
    },

    setCategoryOption(category, event, index, selectedCategoryOption) {

        console.log("selecting category option")
        console.log(selectedCategoryOption)
        console.log(category)
    },

    renderMenuItemsForSelectFields(categoryOptions) {
        const menuItemsForSelectFields = []
        categoryOptions.map(function(categoryOption){
            menuItemsForSelectFields.push(<MenuItem key={categoryOption.id} value={categoryOption.id} primaryText={categoryOption.displayName}/>);
        })
        return menuItemsForSelectFields;
    },

    renderSelectFields() {
        var _this = this;

        const contentStyle={
            padding:"0.5rem"
        }

        const categorySelectFields = []
        this.state.categories.map(function(category){
            
            categorySelectFields.push(<SelectField
                style={contentStyle}
                // value={this.state.value}
                // onChange={this._loadCategoryOptions}
                onChange={_this.setCategoryOption.bind(this, category)}
                floatingLabelText="Choose Category"
                // menuItems={this.renderMenuItems}
                >
                {category.categoryOptions ? _this.renderMenuItemsForSelectFields(category.categoryOptions): null}  
            </SelectField>)
        })
        // Add Button to Submit
        //categorySelectFields.push()
        return categorySelectFields;
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
                    value={this.state.categoryComboId}
                    onChange={this._loadCategoryOptions}
                    floatingLabelText="Choose Category Combo"
                    >
                    {this.state.categoryComboItems ? this.renderMenuItems(): null}
                </SelectField>

                {this.state.categories ? this.renderSelectFields(): null}            
            </DrawerPanel>
        );
    },

});