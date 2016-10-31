import React from 'react';

export default React.createClass({
    propTypes: {
        source: React.PropTypes.arrayOf(React.PropTypes.shape({
            label: React.PropTypes.string,
            value: React.PropTypes.string,
        })).isRequired,
        onItemDoubleClick: React.PropTypes.func.isRequired,
        onItemClick: React.PropTypes.func,
        listStyle: React.PropTypes.object,
        size: React.PropTypes.number,
        selectedValue: React.PropTypes.string
    },

    render() {
        return (
            <div className="list-select">
                <select value={this.props.selectedValue} size={this.props.size || 15} style={Object.assign({overflowX: 'auto'}, this.props.listStyle)}>
                    {this.props.source.map(item => {
                        return (
                            <option style={{ padding: '.25rem' }} onClick={this.listItemClicked} onDoubleClick={this.listItemDoubleClicked} value={item.value}>{item.label}</option>
                        );
                    })}
                </select>
            </div>
        );
    },

    listItemDoubleClicked(event) {
        const clickedItemValue = event.target.value;
        if (this.props.onItemDoubleClick) {
            this.props.onItemDoubleClick(clickedItemValue);
        }
    },

    listItemClicked(event) {
        const clickedItemValue = event.target.value;
        if (this.props.onItemClick) {
            this.props.onItemClick(clickedItemValue);
        }
    }
});
