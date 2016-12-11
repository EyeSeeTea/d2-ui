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
    categoryComboItems: null,
    categories: [],
    categoryOptionComboItems: null,
    selectionValid: true
}

export default React.createClass({

    propTypes: {
        dataElementOperandId: React.PropTypes.string,
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
        if (newProps.dataElementOperandId != undefined && newProps.dataElementOperandId != this.props.dataElementOperandId) {
            this.setState(initialState);

            this.context.d2.models.dataElements.get(newProps.dataElementOperandId, { paging: false, fields: 'id, dataSets[id, categoryCombo[id,displayName, categories[id,displayName,categoryOptions[id,displayName]],categoryOptionCombos[id,categoryOptions]]]' })
                .then(dataElement => dataElement.dataSets.toArray())
                .then(dataSets => {

                    const categoryComboItems =
                        new Map(dataSets.map(dataSet => {
                            return [dataSet.categoryCombo.id, //{
                                // name: dataSet.categoryCombo.displayName,
                                // categories: dataSet.categoryCombo.categories
                                dataSet.categoryCombo
                            //}
                            ]
                        }));
                    this.setState({ categoryComboItems: categoryComboItems })

                    const categoryOptionComboItems =
                        new Map(dataSets.map(dataSet => {
                            return [dataSet.categoryCombo.id, dataSet.categoryCombo.categoryOptionCombos]
                        }));
                    this.setState({ categoryOptionComboItems: categoryOptionComboItems })

                });
        }
    },

    loadCategoryOptions(event) {
        this.setState({ categoryComboId: event.target.value })
        var categoryCombo = this.state.categoryComboItems.get(event.target.value)
        this.setState({ categories: categoryCombo.categories })
        this.setState({ categoryComboOptionsSelected: {} })
        this.setState({ selectionValid : false})
    },

    handleChangeSelection(category, event) {
        var newState = this.state.categoryComboOptionsSelected;
        newState[category.id] = event.target.value;
        this.setState({ categoryComboOptionsSelected: newState });
        this.setState({ selectionValid : (Object.values(newState).length == this.state.categories.length)});
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
            var categoryOptionComboItems = this.state.categoryOptionComboItems.get(this.state.categoryComboId)

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

    render() {
        return (
            <DrawerPanel embedded={true} width={'50%'} title="Dataset Attribute Combination">
                <div style={{padding: '0.5rem'}}>
                    <DropDown
                        value={this.state.categoryComboId}
                        menuItems={this.state.categoryComboItems ? Array.from(this.state.categoryComboItems.values()): []}
                        onChange={this.loadCategoryOptions}
                        floatingLabelText="Choose Category Combo"
                        />

                    {this.state.categories ? this.renderSelectFields() : null}

                    <FlatButton label="Add Operator" style={{margin: '1rem 0rem'}} onTouchTap={this.addOperatorToFormula} disabled={!this.state.selectionValid} />
                </div>
            </DrawerPanel>
        );
    }
});