'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getTranslationFormFor = getTranslationFormFor;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _circularProgress = require('material-ui/lib/circular-progress');

var _circularProgress2 = _interopRequireDefault(_circularProgress);

var _textField = require('material-ui/lib/text-field');

var _textField2 = _interopRequireDefault(_textField);

var _Translate = require('../i18n/Translate.mixin');

var _Translate2 = _interopRequireDefault(_Translate);

var _LocaleSelector = require('../i18n/LocaleSelector.component');

var _LocaleSelector2 = _interopRequireDefault(_LocaleSelector);

var _translationForm = require('./translationForm.actions');

var _camelCaseToUnderscores = require('d2-utilizr/lib/camelCaseToUnderscores');

var _camelCaseToUnderscores2 = _interopRequireDefault(_camelCaseToUnderscores);

var _withStateFrom = require('../component-helpers/withStateFrom');

var _withStateFrom2 = _interopRequireDefault(_withStateFrom);

var _raisedButton = require('material-ui/lib/raised-button');

var _raisedButton2 = _interopRequireDefault(_raisedButton);

var _rx = require('rx');

var _Store = require('../store/Store');

var _Store2 = _interopRequireDefault(_Store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getTranslationFormData(model) {
    var translationStore = _Store2.default.create();

    (0, _translationForm.getTranslationsForModel)(model).subscribe(function (translations) {
        translationStore.setState(translations);
    });

    return _rx.Observable.combineLatest((0, _translationForm.getLocales)(), translationStore, function () {
        for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
            data[_key] = arguments[_key];
        }

        return Object.assign.apply(Object, [{
            objectToTranslate: model,
            setTranslations: function setTranslations(translations) {
                translationStore.setState({
                    translations: translations
                });
            }
        }].concat(data));
    });
}

var TranslationForm = _react2.default.createClass({
    displayName: 'TranslationForm',

    propTypes: {
        onTranslationSaved: _react2.default.PropTypes.func.isRequired,
        onTranslationError: _react2.default.PropTypes.func.isRequired,
        objectToTranslate: _react2.default.PropTypes.shape({
            id: _react2.default.PropTypes.string.isRequired
        }),
        fieldsToTranslate: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string)
    },

    mixins: [_Translate2.default],

    getInitialState: function getInitialState() {
        return {
            loading: true,
            translations: {},
            translationValues: {},
            currentSelectedLocale: ''
        };
    },
    getDefaultProps: function getDefaultProps() {
        return {
            fieldsToTranslate: ['name', 'shortName', 'description']
        };
    },
    getLoadingdataElement: function getLoadingdataElement() {
        return _react2.default.createElement(
            'div',
            { style: { textAlign: 'center' } },
            _react2.default.createElement(_circularProgress2.default, { mode: 'indeterminate' })
        );
    },
    renderFieldsToTranslate: function renderFieldsToTranslate() {
        var _this = this;

        return this.props.fieldsToTranslate.filter(function (fieldName) {
            return fieldName;
        }).map(function (fieldName) {
            return _react2.default.createElement(
                'div',
                { key: fieldName },
                _react2.default.createElement(_textField2.default, { floatingLabelText: _this.getTranslation((0, _camelCaseToUnderscores2.default)(fieldName)),
                    value: _this.getTranslationValueFor(fieldName),
                    fullWidth: true,
                    onChange: _this._setValue.bind(_this, fieldName)
                }),
                _react2.default.createElement(
                    'div',
                    null,
                    _this.props.objectToTranslate[fieldName]
                )
            );
        });
    },
    renderForm: function renderForm() {
        return _react2.default.createElement(
            'div',
            null,
            this.renderFieldsToTranslate(),
            _react2.default.createElement(_raisedButton2.default, {
                label: this.getTranslation('save'),
                primary: true,
                onClick: this._saveTranslations
            }),
            _react2.default.createElement(_raisedButton2.default, {
                style: { marginLeft: '1rem' },
                label: this.getTranslation('cancel'),
                onClick: this.props.onCancel
            })
        );
    },
    renderHelpText: function renderHelpText() {
        return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
                'p',
                null,
                this.getTranslation('select_a_locale_to_enter_translations_for_that_language')
            )
        );
    },
    render: function render() {
        if (!this.props.locales && !this.props.translations) {
            return this.getLoadingdataElement();
        }

        return _react2.default.createElement(
            'div',
            { style: { minHeight: 250 } },
            _react2.default.createElement(_LocaleSelector2.default, { locales: this.props.locales, onChange: this.setCurrentLocale }),
            Boolean(this.state.currentSelectedLocale) ? this.renderForm() : this.renderHelpText()
        );
    },
    getTranslationValueFor: function getTranslationValueFor(fieldName) {
        var _this2 = this;

        var translation = this.props.translations.find(function (t) {
            return t.locale === _this2.state.currentSelectedLocale && t.property.toLowerCase() === (0, _camelCaseToUnderscores2.default)(fieldName);
        });

        if (translation) {
            return translation.value;
        }
    },
    setCurrentLocale: function setCurrentLocale(locale) {
        this.setState({
            currentSelectedLocale: locale
        });
    },
    _setValue: function _setValue(property, event) {
        var _this3 = this;

        var newTranslations = [].concat(this.props.translations);
        var translation = newTranslations.find(function (t) {
            return t.locale === _this3.state.currentSelectedLocale && t.property.toLowerCase() === (0, _camelCaseToUnderscores2.default)(property);
        });

        if (translation) {
            if (event.target.value) {
                translation.value = event.target.value;
            } else {
                // Remove translation from the array
                newTranslations = newTranslations.filter(function (t) {
                    return t !== translation;
                });
            }
        } else {
            translation = {
                property: (0, _camelCaseToUnderscores2.default)(property).toUpperCase(),
                locale: this.state.currentSelectedLocale,
                value: event.target.value
            };

            newTranslations.push(translation);
        }

        this.props.setTranslations(newTranslations);
    },
    _saveTranslations: function _saveTranslations() {
        (0, _translationForm.saveTranslations)(this.props.objectToTranslate, this.props.translations).subscribe(this.props.onTranslationSaved, this.props.onTranslationError);
    }
});

exports.default = TranslationForm;
function getTranslationFormFor(model) {
    return (0, _withStateFrom2.default)(getTranslationFormData(model), TranslationForm);
}