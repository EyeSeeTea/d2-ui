import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import React from 'react';
import classes from 'classnames';
import Translate from '../i18n/Translate.mixin';
import ArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up.js';
import ArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down.js';
import isString from 'd2-utilizr/lib/isString';

const DataTableHeader = React.createClass({
    propTypes: {
        isOdd: React.PropTypes.bool,
        name: React.PropTypes.string,
        text: React.PropTypes.string,
        contents: React.PropTypes.element,
        sortable: React.PropTypes.bool,
        sorting: React.PropTypes.oneOf(['asc', 'desc']),
        onSortingToggle: React.PropTypes.func,
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
        const {isOdd, sortable, name, text, contents} = this.props;
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
                {...(sortable ? {onClick: this.props.onSortingToggle, style: {cursor: "pointer"}} : {})}
            >
                {contents}
                {isString(text) ? text : (name ? this.getTranslation(camelCaseToUnderscores(name)) : null)}
                {sortable ? this._renderSorting() : null}
            </div>
        );
    },
});

export default DataTableHeader;
