import React from 'react';
import PropTypes from "prop-types";
import OrgUnitTree from '../org-unit-tree/OrgUnitTreeMultipleRoots.component';
import OrgUnitSelectByLevel from './OrgUnitSelectByLevel.component';
import OrgUnitSelectByGroup from './OrgUnitSelectByGroup.component';
import OrgUnitSelectAll from './OrgUnitSelectAll.component';
import TextField from 'material-ui/TextField/TextField';
import RaisedButton from 'material-ui/FlatButton/FlatButton';
import Card from 'material-ui/Card/Card';
import Action from '../action/Action';
import { Observable } from 'rx';
import { config } from 'd2/lib/d2';

export default class OrganisationUnitTreeMultiSelect extends React.Component {
    constructor(...args) {
        super(...args);

        this.state = {
            searchValue: '',
            rootOrgUnits: [],
            selectedOrgUnits: [],
        };

        this._searchOrganisationUnits = Action.create('searchOrganisationUnits');

        this._handleClick = this._handleClick.bind(this);
        this._setSelection = this._setSelection.bind(this);
        this._selectAll = this._selectAll.bind(this);
        this._deselectAll = this._deselectAll.bind(this);
    }

    componentDidMount() {
        const d2 = this.context.d2;

        const overlyComplicatedTemporaryFixForWeirdlyNamedFields = (plural) => {
            if (plural === 'organisationUnitGroups') {
                return 'groups';
            }

            return plural;
        };

        const { levels: levelsFilter, groups: groupsFilter } = this.props.filters || {};

        Promise.all([
            d2.currentUser.getOrganisationUnits({
                memberCollection: overlyComplicatedTemporaryFixForWeirdlyNamedFields(this.props.modelDefinition.plural),
                memberObject: this.props.model.id,
                fields: 'id,path,displayName,code,level,children::isNotEmpty',
            }),
            d2.models.organisationUnitLevels.list({
                paging: false,
                fields: 'id,level,displayName',
                order: 'level:asc',
                filter: levelsFilter,
            }),
            d2.models.organisationUnitGroups.list({
                paging: false,
                fields: 'id,displayName',
                filter: groupsFilter,
            }),
        ])
            .then(([
                orgUnits,
                levels,
                groups,
            ]) => {
                const rootOrgUnits = orgUnits
                    .toArray()
                    .filter(ou => (new RegExp(`${this.state.searchValue}`)).test(ou.displayName));

                this.setState({
                    originalRoots: rootOrgUnits,
                    rootOrgUnits,
                    currentRoot: rootOrgUnits[0],
                    selectedOrgUnits: this.props.value.toArray().map(ou => ou.path),
                    orgUnitGroups: groups,
                    orgUnitLevels: levels,
                });
            });

        this.disposable = this._searchOrganisationUnits.map(action => action.data)
            .debounce(400)
            .map(searchValue => {
                if (!searchValue.trim()) {
                    return Observable.just(this.state.originalRoots);
                }

                const organisationUnitRequest = this.context.d2.models.organisationUnits
                    .filter().on('displayName').ilike(searchValue)
                    // withinUserHierarchy makes the query only apply to the subtrees of the organisation units that are
                    // assigned to the current user
                    .list({ fields: 'id,displayName,path,code,level,children::isNotEmpty', withinUserHierarchy: true })
                    .then(modelCollection => modelCollection.toArray());

                return Observable.fromPromise(organisationUnitRequest);
            })
            .concatAll()
            .subscribe((models) => this.setState({ rootOrgUnits: models }));
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            selectedOrgUnits: nextProps.value.toArray().map(ou => ou.path),
        });
    }

    componentWillUnmount() {
        this.disposable && this.disposable.dispose();
    }

    renderRoots() {
        const treeWrapperStyle = {
            height: 349,
            minWidth: 350,
            maxWidth: 480,
            overflow: 'auto',
            border: '1px solid #bdbdbd',
            borderRadius: 3,
            padding: 4,
            margin: '4px 0',
            display: 'inline-block',
            verticalAlign: 'top',
        };

        return (
            <div style={treeWrapperStyle}>
                {this.state.rootOrgUnits.length
                    ? this.state.rootOrgUnits.map(rootOu => (
                        <OrgUnitTree
                            key={rootOu.id}
                            root={rootOu}
                            selected={this.state.selectedOrgUnits}
                            onSelectClick={this._handleClick}
                            currentRoot={this.state.currentRoot}
                            onChangeCurrentRoot={(currentRoot) => this.setState({ currentRoot })}
                            initiallyExpanded={[rootOu.path]}
                        />
                    ))
                    : (<div>{this.context.d2.i18n.getTranslation('no_roots_found')}</div>)
                }
            </div>
        );
    }

    _selectAll() {
        const { currentRoot } = this.state;
        const { organisationUnits } = this.props.model;

        const userOus$ = this.context.d2.models.organisationUnit.list({
            fields: "id,path",
            withinUserHierarchy: true,
            paging: false,
            ...(currentRoot ? {filter: `path:like:${currentRoot.id}`} : {}),
        });
        userOus$.then(userOus => {
            const selectedPaths = userOus.toArray().map(ou => ou.path);
            userOus.forEach(ou => { organisationUnits.add(ou); });
            const selectedOrgUnits = organisationUnits.toArray().map(ou => ou.path);
            this.setState({ selectedOrgUnits }, () => { this.props.onChange(organisationUnits); });
        });
    }

    _deselectAll() {
        const { currentRoot } = this.state;
        const { organisationUnits } = this.props.model;
        organisationUnits.forEach(ou => {
            if (!currentRoot || ou.path.startsWith(currentRoot.path)) {
              organisationUnits.remove(ou);
            }
        });
        const selectedOrgUnits = organisationUnits.toArray().map(ou => ou.path);

        this.setState({ selectedOrgUnits },
            () => { this.props.onChange(organisationUnits); });
    }

    render() {
        if (!this.state.rootOrgUnits) {
            return (<div>this.context.d2.i18n.getTranslation('determining_your_root_orgunits')</div>);
        }

        const controlStyles = {
            width: 500,
            height: 360,
            zIndex: 1,
            background: 'white',
            marginLeft: '1rem',
            marginTop: '0.3rem',
            display: 'inline-block',
        };
        const helpStyles = {
            width: 500,
            zIndex: 1,
            background: 'white',
            marginLeft: '1rem',
            marginTop: '1rem',
            verticalAlign: 'middle',
            display: 'inline-block',
            color: 'rgba(0,0,0,0.5)',
        };
        const controlOverlayStyles = this.state.currentRoot ? {} : {
            position: 'absolute',
            width: 495,
            height: 240,
            marginLeft: -10,
            marginTop: 4,
            backgroundColor: 'rgba(230,230,230,0.3)',
            zIndex: 2,
            borderRadius: 8,
        };
        const currentRootStyle = {
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 3,
            backgroundColor: 'rgba(0,0,0,0.05)',
            padding: 2,
            margin: 4,
        };
        const style = {
            button: {
                position: 'relative',
                top: 3,
                marginLeft: 16,
                boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.12), 0px 1px 4px rgba(0, 0, 0, 0.12)',
            },
            card: {
                padding: "10px 10px",
                boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 2px, rgba(0, 0, 0, 0.117647) 0px 1px 4px',
            },
        };
        style.button1 = Object.assign({}, style.button, { marginLeft: 0 });
        
        const getTranslation = this.context.d2.i18n.getTranslation.bind(this.context.d2.i18n);

        return (
            <div style={{ position: 'relative', minWidth: 850 }}>
                <TextField
                    onChange={(event) => this._searchOrganisationUnits(event.target.value)}
                    floatingLabelText={this.context.d2.i18n.getTranslation('filter_organisation_units_by_name')}
                    fullWidth
                />
                <div className="organisation-unit-tree__selected">
                    <div>
                        {this.state.selectedOrgUnits.length}
                        &nbsp;
                        {this.context.d2.i18n.getTranslation('organisation_units_selected')}
                    </div>
                </div>
                {this.renderRoots()}
                {this.state.orgUnitGroups && this.state.orgUnitLevels && (
                    <div style={controlStyles}>
                        <Card style={style.card}>
                            <span>
                                {this.context.d2.i18n.getTranslation('for_all_organisation_units')}
                                <span style={currentRootStyle}>{this.state.currentRoot.displayName}</span>:
                            </span>
                            <div style={controlOverlayStyles}></div>
                            <div style={{ marginTop: 8, marginBottom: 16 }}>
                                <RaisedButton onClick={this._selectAll} label={getTranslation('select_all_in_tree')} style={style.button1}/>
                                <RaisedButton onClick={this._deselectAll} label={getTranslation('deselect_all_in_tree')} style={style.button}/>
                            </div>
                        </Card>

                        <Card style={{...style.card, marginTop: 10}}>
                            {this.state.currentRoot
                                ? (
                                    <span>{this.context.d2.i18n.getTranslation('for_organisation_units_within')}
                                        <span style={currentRootStyle}>{this.state.currentRoot.displayName}</span>:
                                    </span>
                                ) : (
                                    <span>{this.context.d2.i18n.getTranslation('select_a_parent_organisation_unit')}</span>
                                )
                            }
                            <div style={controlOverlayStyles}></div>
                            <OrgUnitSelectByLevel
                                levels={this.state.orgUnitLevels}
                                selected={this.state.selectedOrgUnits}
                                currentRoot={this.state.currentRoot}
                                onUpdateSelection={this._setSelection}
                            />
                            <OrgUnitSelectByGroup
                                groups={this.state.orgUnitGroups}
                                selected={this.state.selectedOrgUnits}
                                currentRoot={this.state.currentRoot}
                                onUpdateSelection={this._setSelection}
                            />
                            <div>
                                <OrgUnitSelectAll
                                    selected={this.state.selectedOrgUnits}
                                    currentRoot={null}
                                    onUpdateSelection={this._setSelection}
                                />
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    _setSelection(selectedOrgUnitPaths, newOrgUnits = []) {
        const d2 = this.context.d2;
        const modelOrgUnits = this.props.model.organisationUnits;
        const assigned = modelOrgUnits.toArray().map(ou => ou.path);
        const newOrgUnitsNamesById = _(newOrgUnits).map(ou => [ou.id, ou.displayName]).fromPairs().value();
        const createOrgUnit = path => {
            const id = path.substr(path.lastIndexOf('/') + 1);
            const displayName = newOrgUnitsNamesById[id];
            return d2.models.organisationUnits.create({ id, path, displayName });
        };

        const additions = selectedOrgUnitPaths
            // Filter out already assigned ids
            .filter(path => !assigned.includes(path))
            // Add the rest
            .map(createOrgUnit);

        const deletions = assigned
            // Filter out ids that should be left in
            .filter(path => !selectedOrgUnitPaths.includes(path))
            // Add the rest
            .map(createOrgUnit);

        additions.forEach(ou => {
            modelOrgUnits.add(ou);
        });
        deletions.forEach(ou => {
            modelOrgUnits.remove(ou);
        });

        this.setState({ selectedOrgUnits: selectedOrgUnitPaths },
            () => { this.props.onChange(modelOrgUnits); });
    }

    _handleClick(event, orgUnit) {
        if (this.state.selectedOrgUnits.includes(orgUnit.path)) {
            this.setState(state => {
                state.selectedOrgUnits.splice(state.selectedOrgUnits.indexOf(orgUnit.path), 1);

                this.props.model.organisationUnits.remove(orgUnit);

                return { selectedOrgUnits: state.selectedOrgUnits };
            }, () => { this.props.onChange(this.props.model.organisationUnits); });
        } else {
            this.setState(state => {
                state.selectedOrgUnits.push(orgUnit.path);

                this.props.model.organisationUnits.add(orgUnit);

                return { selectedOrgUnits: state.selectedOrgUnits };
            }, () => { this.props.onChange(this.props.model.organisationUnits); });
        }
    }
}
OrganisationUnitTreeMultiSelect.contextTypes = {
    d2: PropTypes.object.isRequired,
};
OrganisationUnitTreeMultiSelect.propTypes = {
    value: PropTypes.object,
    filters: PropTypes.shape({
        levels: PropTypes.string,
        groups: PropTypes.string,
    }),
};
OrganisationUnitTreeMultiSelect.defaultProps = {
    value: [],
    onChange: () => { },
};
