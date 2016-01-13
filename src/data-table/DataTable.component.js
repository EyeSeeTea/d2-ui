import {isArrayOfStrings, isIterable} from 'd2-utils';
import React from 'react';

import DataTableHeader from './DataTableHeader.component';
import DataTableRow from './DataTableRow.component';
import DataTableContextMenu from './DataTableContextMenu.component';

const DataTable = React.createClass({
    propTypes: {
        contextMenuActions: React.PropTypes.object,
        contextMenuIcons: React.PropTypes.object,
        primaryAction: React.PropTypes.func,
        isContextActionAllowed: React.PropTypes.func,
    },

    getInitialState() {
        return this.getStateFromProps(this.props);
    },

    componentWillReceiveProps(newProps) {
        this.setState(this.getStateFromProps(newProps));
    },

    getStateFromProps(props) {
        let dataRows = [];

        if (isIterable(props.rows)) {
            dataRows = props.rows instanceof Map ? Array.from(props.rows.values()) : props.rows;
        }

        return {
            columns: isArrayOfStrings(props.columns) ? props.columns : ['name', 'lastUpdated'],
            dataRows,
        };
    },

    render() {
        const headers = this.state.columns.map((headerName, index) => {
            return (<DataTableHeader key={index} isOdd={Boolean(index % 2)} name={headerName} />);
        });

        const dataRows = [];
        let dataRowsId = 0;
        let dataRowsSource;
        for (dataRowsSource of this.state.dataRows) {
            dataRowsId++;
            dataRows.push(<DataTableRow key={dataRowsId} dataSource={dataRowsSource} columns={this.state.columns} isActive={this.state.activeRow === dataRowsId} itemClicked={this.handleRowClick} primaryClick={this.props.primaryAction || (() => {})} />);
        }

        const actionAccessChecker = (this.props.isContextActionAllowed && this.props.isContextActionAllowed.bind(null, this.state.activeRow)) || (() => true);

        const actionsToShow = Object.keys(this.props.contextMenuActions)
            .filter(actionAccessChecker)
            .reduce((availableActions, actionKey) => {
                availableActions[actionKey] = this.props.contextMenuActions[actionKey];
                return availableActions;
            }, {});

        return (
           <div className="data-table" onClick={this.hideContextMenu} onMouseLeave={this.hideContextMenu}>
               <div className="data-table__headers">
                    {headers}
               </div>
               <div className="data-table__rows">
                   {dataRows}
               </div>
               {this.state.activeRow ? <DataTableContextMenu actions={actionsToShow || {}} activeItem={this.state.activeRow} coords={this.state.contextMenuCoords} icons={this.props.contextMenuIcons} /> : undefined}
           </div>
        );
    },

    handleRowClick(event, rowSource) {
        this.setState({
            contextMenuCoords: {
                Y: event.clientY + window.scrollY - 25,
                X: event.clientX - 25,
            },
            activeRow: rowSource !== this.state.activeRow ? rowSource : undefined,
        });
    },

    hideContextMenu() {
        this.setState({
            activeRow: undefined,
        });
    },
});

export default DataTable;
