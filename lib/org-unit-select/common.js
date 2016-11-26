'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderControls = exports.renderDropdown = exports.handleChangeSelection = exports.removeFromSelectionWithIntersection = exports.removeFromSelection = exports.addToSelectionWithIntersection = exports.addToSelection = exports.filterWithParentSelected = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _DropDown = require('../form-fields/DropDown.component');

var _DropDown2 = _interopRequireDefault(_DropDown);

var _raisedButton = require('material-ui/lib/raised-button');

var _raisedButton2 = _interopRequireDefault(_raisedButton);

var _linearProgress = require('material-ui/lib/linear-progress');

var _linearProgress2 = _interopRequireDefault(_linearProgress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var style = {
    button: {
        position: 'relative',
        top: 3,
        marginLeft: 16
    },
    progress: {
        height: 2,
        backgroundColor: 'rgba(0,0,0,0)',
        top: 46
    }
};
style.button1 = Object.assign({}, style.button, { marginLeft: 0 });

function filterWithParentSelected(orgUnits) {
    var _this = this;

    //Filter only those with a selected parent
    return orgUnits.filter(function (newOrgUnitItem) {
        return _this.props.selected.some(function (aParent) {
            return newOrgUnitItem.path && newOrgUnitItem.id !== aParent && newOrgUnitItem.path.indexOf(aParent) !== -1;
        });
    });
}

function addToSelection(orgUnits) {
    var res = orgUnits;
    this.props.selected.forEach(function (orgUnitId) {
        if (res.indexOf(orgUnitId) === -1) {
            res.push(orgUnitId);
        }
    });
    this.props.onUpdateSelection(res);
}

function addToSelectionWithIntersection(orgUnits) {
    var orgUnitsWithParentSelected = this.filterWithParentSelected(orgUnits);
    this.addToSelection(orgUnitsWithParentSelected.map(function (orgUnit) {
        return orgUnit.id;
    }));
}

function removeFromSelection(orgUnits) {
    this.props.onUpdateSelection(this.props.selected.filter(function (orgUnit) {
        return orgUnits.indexOf(orgUnit) === -1;
    }));
}

function removeFromSelectionWithIntersection(orgUnits) {
    var orgUnitsWithParentSelected = this.filterWithParentSelected(orgUnits);
    this.removeFromSelection(orgUnitsWithParentSelected.map(function (orgUnit) {
        return orgUnit.id;
    }));
}

function handleChangeSelection(event) {
    this.setState({ selection: event.target.value });
}

function renderDropdown(menuItems, label) {
    return _react2.default.createElement(
        'div',
        { style: { position: 'relative', minHeight: 89 } },
        _react2.default.createElement(_DropDown2.default, {
            value: this.state.selection,
            menuItems: menuItems,
            onChange: this.handleChangeSelection,
            floatingLabelText: this.getTranslation(label),
            disabled: this.state.loading
        }),
        this.renderControls()
    );
};

function renderControls() {
    var disabled = this.state.loading || !this.state.selection;

    return _react2.default.createElement(
        'div',
        { style: { position: 'absolute', display: 'inline-block', top: 24, marginLeft: 16 } },
        this.state.loading && _react2.default.createElement(_linearProgress2.default, { size: 0.5, style: style.progress }),
        _react2.default.createElement(_raisedButton2.default, {
            label: this.getTranslation('select'),
            style: style.button1,
            onClick: this.handleSelect,
            disabled: disabled
        }),
        _react2.default.createElement(_raisedButton2.default, {
            label: this.getTranslation('deselect'),
            style: style.button,
            onClick: this.handleDeselect,
            disabled: disabled
        })
    );
}

exports.filterWithParentSelected = filterWithParentSelected;
exports.addToSelection = addToSelection;
exports.addToSelectionWithIntersection = addToSelectionWithIntersection;
exports.removeFromSelection = removeFromSelection;
exports.removeFromSelectionWithIntersection = removeFromSelectionWithIntersection;
exports.handleChangeSelection = handleChangeSelection;
exports.renderDropdown = renderDropdown;
exports.renderControls = renderControls;