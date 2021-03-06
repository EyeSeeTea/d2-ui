import React from 'react';
import LinearProgress from 'material-ui/LinearProgress';

import Model from 'd2/lib/model/Model';
import ModelCollection from 'd2/lib/model/ModelCollection';

import TreeView from '../tree-view/TreeView.component';


const styles = {
    progress: {
        position: 'absolute',
        display: 'inline-block',
        width: '100%',
        left: -8,
    },
    progressBar: {
        height: 2,
        backgroundColor: 'transparent',
    },
    spacer: {
        position: 'relative',
        display: 'inline-block',
        width: '1.2rem',
        height: '1rem',
    },
    label: {
        display: 'inline-block',
    },
    changeRootLabel: {
        fontSize: 11,
        display: 'inline-block',
        fontWeight: 300,
        marginLeft: 8,
        color: 'blue',
        cursor: 'pointer',
    },
    ouContainer: {
        borderColor: 'transparent',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRightWidth: 0,
        borderRadius: '3px 0 0 3px',
        background: 'transparent',
        paddingLeft: 2,
    },
    currentOuContainer: {
        background: 'rgba(0,0,0,0.05)',
        borderColor: 'rgba(0,0,0,0.1)',
    },
};

class OrgUnitTree extends React.Component {
    constructor(props) {
        super(props);

        if (props.hasOwnProperty('onClick')) {
            console.warn('Deprecated: `OrgUnitTree.onClick` has been deprecated. Please use `onSelectClick` instead.');
        }

        this.state = {
            children: (
                props.root.children === false ||
                Array.isArray(props.root.children) && props.root.children.length === 0
            )
                ? []
                : undefined,
            loading: false,
        };
        if (props.root.children instanceof ModelCollection) {
            this.state.children = props.root.children
                .toArray()
                // Sort here since the API returns nested children in random order
                .sort((a, b) => a.displayName.localeCompare(b.displayName));
        }

        this.loadChildren = this.loadChildren.bind(this);
        this.handleSelectClick = this.handleSelectClick.bind(this);
    }

    componentDidMount() {
        if (this.props.initiallyExpanded === this.props.root.id ||
            this.props.initiallyExpanded.indexOf(this.props.root.id) >= 0) {
            this.loadChildren();
        }
    }

    componentWillReceiveProps(newProps) {
        if ((newProps.initiallyExpanded === newProps.root.id ||
            newProps.initiallyExpanded.indexOf(newProps.root.id) >= 0) ||
            newProps.idsThatShouldBeReloaded.indexOf(newProps.root.id) >= 0) {
            this.loadChildren();
        }
    }

    loadChildren() {
        if ((this.state.children === undefined && !this.state.loading) || this.props.idsThatShouldBeReloaded.indexOf(this.props.root.id) >= 0) {
            this.setState({ loading: true });

            const root = this.props.root;
            root.modelDefinition.get(root.id, {
                fields: 'children[id,displayName,children::isNotEmpty,path,parent]',
            }).then(unit => {
                this.setState({
                    children: unit.children
                        .toArray()
                        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
                    loading: false,
                });
            });
        }
    }

    handleSelectClick(e) {
        if (this.props.onSelectClick) {
            this.props.onSelectClick(e, this.props.root);
        } else if (this.props.onClick) {
            // TODO: onClick is deprecated and should be removed in v26
            this.props.onClick(e, this.props.root);
        }
        e.stopPropagation();
    }

    renderChildren() {
        // If initiallyExpanded is an array, remove the current root id and pass the rest on
        // If it's a string, pass it on unless it's the current root id
        const expandedProp = Array.isArray(this.props.initiallyExpanded)
            ? this.props.initiallyExpanded.filter(id => id !== this.props.root.id)
            : this.props.initiallyExpanded !== this.props.root.id && this.props.initiallyExpanded || [];

        if (Array.isArray(this.state.children) && this.state.children.length > 0) {
            return this.state.children.map(orgUnit => (
                <OrgUnitTree
                    key={orgUnit.id}
                    root={orgUnit}
                    selected={this.props.selected}
                    initiallyExpanded={expandedProp}
                    onSelectClick={this.props.onSelectClick || this.props.onClick}
                    currentRoot={this.props.currentRoot}
                    onChangeCurrentRoot={this.props.onChangeCurrentRoot}
                    labelStyle={this.props.labelStyle}
                    selectedLabelStyle={this.props.selectedLabelStyle}
                    arrowSymbol={this.props.arrowSymbol}
                    idsThatShouldBeReloaded={this.props.idsThatShouldBeReloaded}
                    hideCheckboxes={this.props.hideCheckboxes}
                />));
        }

        if (this.state.loading || true) {
            return <div style={styles.progress}><LinearProgress style={styles.progressBar} /></div>;
        }

        return null;
    }

    render() {
        const currentOu = this.props.root;

        // True if this OU has children = is not a leaf node
        const hasChildren = this.state.children === undefined || Array.isArray(this.state.children) &&
            this.state.children.length > 0;
        // True if a click handler exists
        const isSelectable = !!this.props.onSelectClick || !!this.props.onClick; // TODO: Remove onClick in v26
        // True if this OU is currently selected
        const isSelected = this.props.selected &&
            (this.props.selected === currentOu.id || this.props.selected.includes(currentOu.id));
        // True if this OU is the current root
        const isCurrentRoot = this.props.currentRoot && this.props.currentRoot.id === currentOu.id;
        // True if this OU should be expanded by default
        const isInitiallyExpanded = this.props.initiallyExpanded === currentOu.id ||
            this.props.initiallyExpanded.includes(currentOu.id);
        // True if this OU can BECOME the current root, which means that:
        // 1) there is a change root handler
        // 2) this OU is not already the current root
        // 3) this OU has children (is not a leaf node)
        const canBecomeCurrentRoot = this.props.onChangeCurrentRoot && !isCurrentRoot && hasChildren;

        // Hard coded styles for OU name labels - can be overridden with the selectedLabelStyle and labelStyle props
        const labelStyle = Object.assign({}, styles.label, {
            fontWeight: isSelected ? 500 : 300,
            color: isSelected ? 'orange' : 'inherit',
            cursor: canBecomeCurrentRoot ? 'pointer' : 'default',
        }, isSelected ? this.props.selectedLabelStyle : this.props.labelStyle);

        // Styles for this OU and OUs contained within it
        const ouContainerStyle = Object.assign({}, styles.ouContainer, isCurrentRoot ? styles.currentOuContainer : {});

        // Wrap the change root click handler in order to stop event propagation
        const setCurrentRoot = (e) => {
            e.stopPropagation();
            this.props.onChangeCurrentRoot(currentOu);
        };

        const label = (
            <div style={labelStyle} onClick={(canBecomeCurrentRoot && setCurrentRoot) || (isSelectable && this.handleSelectClick)}>
                {isSelectable && !this.props.hideCheckboxes && (
                    <input type="checkbox" readOnly disabled={!isSelectable} checked={isSelected} onClick={this.handleSelectClick}/>
                )}
                {currentOu.displayName}
            </div>
        );

        if (hasChildren) {
            return (
                <TreeView
                    label={label}
                    onExpand={this.loadChildren}
                    persistent
                    initiallyExpanded={isInitiallyExpanded}
                    arrowSymbol={this.props.arrowSymbol}
                    className="orgunit with-children"
                    style={ouContainerStyle}
                >
                    {this.renderChildren()}
                </TreeView>
            );
        }

        return (
            <div onClick={isSelectable && this.handleSelectClick}
                 className="orgunit without-children"
                 style={ouContainerStyle}
            >
                <div style={styles.spacer}></div>{label}
            </div>
        );
    }
}

OrgUnitTree.propTypes = {
    /**
     * The root OrganisationUnit of the tree
     *
     * If the root OU is known to have no children, the `children` property of the root OU should be either
     * `false` or an empty array. If the children property is undefined, the children will be fetched from
     * the server when the tree is expanded.
     */
    root: React.PropTypes.instanceOf(Model).isRequired,

    /**
     * An array of IDs of selected OUs
     */
    selected: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.string),
        React.PropTypes.string,
    ]),

    /**
     * An array of IDs of OUs that will be expanded automatically as soon as they are encountered
     *
     * Note that only IDs that are actually encountered during rendering are expanded. If you wish to expand
     * the tree until a specific OU, the IDs of all parent OUs of that OU will have to be included in the
     * initiallyExpanded array as well.
     */
    initiallyExpanded: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.string),
        React.PropTypes.string,
    ]),

    /**
     * onSelectClick callback, which is triggered when the label of an OU is clicked
     *
     * The onSelectClick callback will receive two arguments: The original click event, and an object containing
     * the displayName and id of the OU that was clicked.
     */
    onSelectClick: React.PropTypes.func,

    /**
     * onChangeCurrentRoot callback, which is triggered when the change current root label is clicked. Setting this also
     * enables the display of the change current root label
     *
     * the onChangeCurrentRoot callback will receive two arguments: The original click event, and the organisation unit
     * model object that was selected as the new root
     */
    onChangeCurrentRoot: React.PropTypes.func,

    /**
     * Organisation unit model representing the current root
     */
    currentRoot: React.PropTypes.object,

    /**
     * If true, only org units that have at least 1 child will be displayed
     */
    hideLeafNodes: React.PropTypes.bool,

    /**
     * Custom styling for OU labels
     */
    labelStyle: React.PropTypes.object,

    /**
     * Custom styling for the labels of selected OUs
     */
    selectedLabelStyle: React.PropTypes.object,

    /**
     * Custom arrow symbol
     */
    arrowSymbol: React.PropTypes.string,

    /**
     * If true, don't display checkboxes next to org unit labels
     */
    hideCheckboxes: React.PropTypes.bool,
};

OrgUnitTree.defaultProps = {
    initiallyExpanded: [],
    labelStyle: {},
    selectedLabelStyle: {},
    idsThatShouldBeReloaded: [],
    hideCheckboxes: false,
};

export default OrgUnitTree;
