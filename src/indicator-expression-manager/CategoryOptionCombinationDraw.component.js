import React from 'react';
import DrawerPanel from '../drawer-panel/DrawerPanel.component';
import { Observable } from 'rx';
import log from 'loglevel';
import { config } from 'd2/lib/d2';
import Translate from '../i18n/Translate.mixin';

import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import FlatButton from 'material-ui/lib/flat-button';
import DropDown from '../form-fields/DropDown.component';

config.i18n.strings.add('please_select_a_dataset');

const initialState = {
    categoryComboId: null,
    categoryComboOptionsSelected: {},
    categories: []
}

export default React.createClass({

    propTypes: {
        dataElementOperandId: React.PropTypes.string,
        categoryCombos: React.PropTypes.object.isRequired,
        dataElementOperandSelectorAction: React.PropTypes.func.isRequired
    },

    mixins: [Translate],

    getInitialState() {
        return initialState;
    },

    componentWillUnmount() {
        this.disposable && this.disposable.dispose();
    },

    componentWillReceiveProps(newProps) {
        if (newProps.categoryCombos != undefined && newProps.categoryCombos != this.props.categoryCombos) {
            this.setState(initialState);
        }
    },

    loadCategoryOptions(event) {
        
        var categoryCombo = this.props.categoryCombos.get(event.target.value)
        this.setState({ 
            categoryComboId: event.target.value,
            categories: categoryCombo.categories,
            categoryComboOptionsSelected: {}
         })
    },

    handleChangeSelection(category, event) {
        var newState = this.state.categoryComboOptionsSelected;
        newState[category.id] = event.target.value;
        this.setState({ categoryComboOptionsSelected: newState });
    },

    renderSelectFields() {
        var _this = this;

        const categorySelectFields = []
        this.state.categories.map(function (category) {
            categorySelectFields.push(<DropDown
                value={_this.state.categoryComboOptionsSelected[category.id]}
                onChange={_this.handleChangeSelection.bind(this, category)}
                floatingLabelText={"Choose " + category.displayName}
                menuItems={category.categoryOptions}
                />)
        })

        return categorySelectFields;
    },

    addOperatorToFormula(event) {

        if (this.state.categoryComboId) {
            var categoryOptionComboItems = this.props.categoryCombos.get(this.state.categoryComboId).categoryOptionCombos;

            var categoryComboOptionsSelectedValue = Object.values(this.state.categoryComboOptionsSelected)
            for (var categoryOptionComboItemIndex in categoryOptionComboItems) {
                var categoryOptionComboFound = true;
                for (var categoryOptionIndex in categoryOptionComboItems[categoryOptionComboItemIndex].categoryOptions) {
                    if (categoryComboOptionsSelectedValue.indexOf(categoryOptionComboItems[categoryOptionComboItemIndex].categoryOptions[categoryOptionIndex].id) == -1) {
                        categoryOptionComboFound = false;
                        break;
                    }
                }
                if (categoryOptionComboFound) {
                    this.props.dataElementOperandSelectorAction(this.props.dataElementOperandId + "." + categoryOptionComboItems[categoryOptionComboItemIndex].id);
                    break;
                }
            }
        }
        else {
            this.props.dataElementOperandSelectorAction(this.props.dataElementOperandId);
        }
    },

    isSelectionValid() {
        return (!this.state.categoryComboId || (Object.values(this.state.categoryComboOptionsSelected).length == this.state.categories.length));
    },

    render() {
        return (
            <DrawerPanel embedded={true} width={'50%'} title="Dataset Attribute Combination">
                <div style={{ padding: '0.5rem' }}>
                    <DropDown
                        value={this.state.categoryComboId}
                        menuItems={this.props.categoryCombos ? Array.from(this.props.categoryCombos.values()) : []}
                        onChange={this.loadCategoryOptions}
                        floatingLabelText="Choose Category Combo"
                        />

                    {this.state.categories ? this.renderSelectFields() : null}

                    <FlatButton label="Add Operator" style={{ margin: '1rem 0rem' }} onTouchTap={this.addOperatorToFormula} disabled={!this.isSelectionValid()} />
                </div>
            </DrawerPanel>
        );
    }
});