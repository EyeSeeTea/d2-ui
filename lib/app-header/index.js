'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.initHeaderBar = initHeaderBar;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _d = require('d2/lib/d2');

var _HeaderBar = require('./HeaderBar');

var _HeaderBar2 = _interopRequireDefault(_HeaderBar);

var _withStateFrom = require('../component-helpers/withStateFrom');

var _withStateFrom2 = _interopRequireDefault(_withStateFrom);

var _headerBar = require('./headerBar.store');

var _headerBar2 = _interopRequireDefault(_headerBar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getBaseUrl(predefLocation) {
    if (predefLocation) {
        return predefLocation;
    }

    return '../api';
}

function initHeaderBar(domElement, apiLocation) {
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var baseUrl = getBaseUrl(apiLocation);

    var noLoadingIndicator = config.noLoadingIndicator,
        _config$schemas = config.schemas,
        schemas = _config$schemas === undefined ? [] : _config$schemas,
        other = _objectWithoutProperties(config, ['noLoadingIndicator', 'schemas']);

    var d2Config = _extends({}, other, {
        baseUrl: baseUrl,
        schemas: schemas
    });

    // Mock d2 for offline header-bar
    var d2Context = {
        currentUser: { userSettings: {} },
        i18n: {
            getTranslation: function getTranslation(v) {
                return v;
            }
        }
    };

    var HeaderBarWithState = (0, _withStateFrom2.default)(_headerBar2.default, _HeaderBar2.default);

    var HeaderBarWithContext = _react2.default.createClass({
        displayName: 'HeaderBarWithContext',

        childContextTypes: {
            d2: _react2.default.PropTypes.object
        },

        getChildContext: function getChildContext() {
            return {
                d2: d2Context
            };
        },
        render: function render() {
            return _react2.default.createElement(HeaderBarWithState, { noLoadingIndicator: noLoadingIndicator });
        }
    });

    (0, _d.init)(d2Config).then(function (d2) {
        d2Context = d2;

        (0, _reactDom.render)(_react2.default.createElement(HeaderBarWithContext, null), domElement);
    }, function () {
        (0, _reactDom.render)(_react2.default.createElement(HeaderBarWithContext, null), domElement);
    });
}

exports.default = initHeaderBar;