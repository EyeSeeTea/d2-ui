'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _common = require('./common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OrgUnitSelectByLevel = function (_React$Component) {
    _inherits(OrgUnitSelectByLevel, _React$Component);

    function OrgUnitSelectByLevel(props, context) {
        _classCallCheck(this, OrgUnitSelectByLevel);

        var _this = _possibleConstructorReturn(this, (OrgUnitSelectByLevel.__proto__ || Object.getPrototypeOf(OrgUnitSelectByLevel)).call(this, props, context));

        _this.state = {
            loading: false,
            selection: undefined
        };
        _this.levelCache = {};

        _this.filterWithParentSelected = _common.filterWithParentSelected.bind(_this);
        _this.addToSelection = _common.addToSelection.bind(_this);
        _this.addToSelectionWithIntersection = _common.addToSelectionWithIntersection.bind(_this);
        _this.removeFromSelection = _common.removeFromSelection.bind(_this);
        _this.removeFromSelectionWithIntersection = _common.removeFromSelectionWithIntersection.bind(_this);
        _this.handleChangeSelection = _common.handleChangeSelection.bind(_this);
        _this.renderControls = _common.renderControls.bind(_this);

        _this.getOrgUnitsForLevel = _this.getOrgUnitsForLevel.bind(_this);
        _this.handleSelect = _this.handleSelect.bind(_this);
        _this.handleDeselect = _this.handleDeselect.bind(_this);

        _this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
        return _this;
    }

    _createClass(OrgUnitSelectByLevel, [{
        key: 'getOrgUnitsForLevel',
        value: function getOrgUnitsForLevel(level) {
            var _this2 = this;

            var ignoreCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return new Promise(function (resolve) {
                if (!ignoreCache && _this2.levelCache.hasOwnProperty(level)) {
                    resolve(_this2.levelCache[level].slice());
                } else {
                    _loglevel2.default.debug('Loading org units for level ' + level);
                    _this2.setState({ loading: true });

                    var d2 = _this2.context.d2;
                    d2.models.organisationUnits.list({ paging: false, level: level, fields: 'id,path' }).then(function (orgUnits) {
                        return orgUnits.toArray().map(function (orgUnit) {
                            return { id: orgUnit.id, path: orgUnit.path };
                        });
                    }).then(function (orgUnitIds) {
                        _loglevel2.default.debug('Loaded ' + orgUnitIds.length + ' org units for level ' + level);
                        _this2.setState({ loading: false });
                        _this2.levelCache[level] = orgUnitIds;

                        // Make a copy of the returned array to ensure that the cache won't be modified from elsewhere
                        resolve(orgUnitIds.slice());
                    }).catch(function (err) {
                        _this2.setState({ loading: false });
                        _loglevel2.default.error('Failed to load org units in level ' + level + ':', err);
                    });
                }
            });
        }
    }, {
        key: 'handleSelect',
        value: function handleSelect() {
            var _this3 = this;

            this.getOrgUnitsForLevel(this.state.selection).then(function (orgUnits) {
                if (_this3.props.intersectionPolicy) {
                    _this3.addToSelectionWithIntersection(orgUnits);
                } else {
                    _this3.addToSelection(orgUnits.map(function (orgUnit) {
                        return orgUnit.id;
                    }));
                }
            });
        }
    }, {
        key: 'handleDeselect',
        value: function handleDeselect() {
            var _this4 = this;

            this.getOrgUnitsForLevel(this.state.selection).then(function (orgUnits) {
                if (_this4.props.intersectionPolicy) {
                    _this4.removeFromSelectionWithIntersection(orgUnits);
                } else {
                    _this4.removeFromSelection(orgUnits.map(function (orgUnit) {
                        return orgUnit.id;
                    }));
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var menuItems = (Array.isArray(this.props.levels) && this.props.levels || this.props.levels.toArray()).map(function (level) {
                return { id: level.level, displayName: level.displayName };
            });
            var label = 'organisation_unit_level';

            // The minHeight on the wrapping div below is there to compensate for the fact that a
            // Material-UI SelectField will change height depending on whether or not it has a value
            return _common.renderDropdown.call(this, menuItems, label);
        }
    }]);

    return OrgUnitSelectByLevel;
}(_react2.default.Component);

OrgUnitSelectByLevel.propTypes = {
    // levels is an array of either ModelCollection objects or plain objects,
    // where each object should contain `level` and `displayName` properties
    levels: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.object, _react2.default.PropTypes.array]).isRequired,

    // selected is an array of selected organisation unit IDs
    selected: _react2.default.PropTypes.array.isRequired,

    // Whenever the selection changes, onUpdateSelection will be called with
    // one argument: The new array of selected organisation units
    onUpdateSelection: _react2.default.PropTypes.func.isRequired,

    //intersectionPolicy a boolean that tells if selection must a subset of current selection or not
    intersectionPolicy: _react2.default.PropTypes.bool

};

OrgUnitSelectByLevel.contextTypes = { d2: _react2.default.PropTypes.any.isRequired };

exports.default = OrgUnitSelectByLevel;