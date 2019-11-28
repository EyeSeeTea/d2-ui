import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import React from 'react';
import PropTypes from "prop-types";
import createReactClass from 'create-react-class';
import classes from 'classnames';
import Translate from '../i18n/Translate.mixin';
import ArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up.js';
import ArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down.js';
import isString from 'd2-utilizr/lib/isString';

const DataTableHeader = createReactClass({
    propTypes: {
        isOdd: PropTypes.bool,
        name: PropTypes.string,
        text: PropTypes.string,
        contents: PropTypes.element,
        sortable: PropTypes.bool,
        sorting: PropTypes.oneOf(['asc', 'desc']),
        onSortingToggle: PropTypes.func,
        style: PropTypes.object,
    },

    mixins: [Translate],

    getDefaultProps() {
        return {
            isOdd: false,
            name: null,
            text: null,
            contents: null,
            sortable: false,
            sorting: null,
            style: {},
        };
    },

    _renderSorting() {
        const style = {width: 16, height: 16};

        switch (this.props.sorting) {
            case "desc":
                return (<ArrowDown style={style} />);
            case "asc":
                return (<ArrowUp style={style} />);
            default:
                // When not visible, render the component anyway to reserve space
                return (<ArrowUp style={_.merge(style, {visibility: 'hidden'})} />)
        }
    },

    render() {
        const {isOdd, sortable, name, text, contents, style} = this.props;
        const styleWithSorting = sortable ? {cursor: "pointer", ...style} : style;
        const classList = classes(
            'data-table__headers__header',
            {
                'data-table__headers__header--even': !isOdd,
                'data-table__headers__header--odd': isOdd,
            }
        );

        return (
            <div 
                className={classList}
                style={styleWithSorting}
                {...(sortable ? {onClick: this.props.onSortingToggle} : {})}
            >
                {contents}
                {isString(text) ? text : (name ? this.getTranslation(camelCaseToUnderscores(name)) : null)}
                {sortable ? this._renderSorting() : null}
            </div>
        );
    },
});

export default DataTableHeader;
