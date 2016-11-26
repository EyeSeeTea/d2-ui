'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d = require('d2/lib/d2');

var _dialog = require('material-ui/lib/dialog');

var _dialog2 = _interopRequireDefault(_dialog);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _TranslationForm = require('./TranslationForm.component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

_d.config.i18n.strings.add('close');
_d.config.i18n.strings.add('sharing_settings');

var TranslationDialog = function (_Component) {
    _inherits(TranslationDialog, _Component);

    function TranslationDialog(props, context) {
        _classCallCheck(this, TranslationDialog);

        var _this = _possibleConstructorReturn(this, (TranslationDialog.__proto__ || Object.getPrototypeOf(TranslationDialog)).call(this, props, context));

        _this.i18n = context.d2.i18n;

        _this.state = {
            TranslationForm: (0, _TranslationForm.getTranslationFormFor)(_this.props.objectToTranslate)
        };

        _this.translationSaved = _this.translationSaved.bind(_this);
        _this.translationError = _this.translationError.bind(_this);
        _this.closeSharingDialog = _this.closeSharingDialog.bind(_this);
        return _this;
    }

    _createClass(TranslationDialog, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                _dialog2.default,
                _extends({
                    title: this.i18n.getTranslation('translation_dialog_title'),
                    autoDetectWindowHeight: true,
                    autoScrollBodyContent: true
                }, this.props),
                _react2.default.createElement(this.state.TranslationForm, {
                    onTranslationSaved: this.translationSaved,
                    onTranslationError: this.translationError,
                    onCancel: this.closeSharingDialog,
                    fieldsToTranslate: this.props.fieldsToTranslate
                })
            );
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (newProps.objectToTranslate) {
                this.setState({
                    TranslationForm: (0, _TranslationForm.getTranslationFormFor)(newProps.objectToTranslate)
                });
            }
        }
    }, {
        key: 'closeSharingDialog',
        value: function closeSharingDialog() {
            this.props.onRequestClose();
        }
    }, {
        key: 'translationSaved',
        value: function translationSaved() {
            this.props.onTranslationSaved();
            this.closeSharingDialog();
        }
    }, {
        key: 'translationError',
        value: function translationError() {
            this.props.onTranslationError();
        }
    }]);

    return TranslationDialog;
}(_react.Component);

exports.default = TranslationDialog;


TranslationDialog.propTypes = {
    objectToTranslate: _react2.default.PropTypes.shape({
        id: _react2.default.PropTypes.string.isRequired
    }).isRequired,
    onTranslationSaved: _react2.default.PropTypes.func.isRequired,
    onTranslationError: _react2.default.PropTypes.func.isRequired,
    open: _react2.default.PropTypes.bool,
    onRequestClose: _react2.default.PropTypes.func.isRequired,
    fieldsToTranslate: _react2.default.PropTypes.array
};

TranslationDialog.contextTypes = {
    d2: _react.PropTypes.object
};