import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { grey600 } from 'material-ui/styles/colors';
import { getDateFromString } from '../../util/dateUtils';
import size from 'lodash/fp/size';
import pick from 'lodash/fp/pick';
import SharingDialog from '@dhis2/d2-ui-sharing-dialog';
import DetailsDialog from '../favorites/DetailsDialog';
import { config } from 'd2/lib/d2';
window.config = config;

//import './DetailsCard.css';

config.i18n.strings.add('no_description');
config.i18n.strings.add('public');
config.i18n.strings.add('access_none');
config.i18n.strings.add('access_read');
config.i18n.strings.add('access_read_write');
config.i18n.strings.add('access_unknown');
config.i18n.strings.add('user_groups');
config.i18n.strings.add('details');
config.i18n.strings.add('owner');
config.i18n.strings.add('created');
config.i18n.strings.add('last_updated');
config.i18n.strings.add('views');
config.i18n.strings.add('sharing');
config.i18n.strings.add('edit_sharing');

const styles = {
    container: {
        paddingBottom: 0,
    },
    headerText: {
        position: 'relative',
        width: 210,
        top: '50%',
        transform: 'translateY(-50%)',
        paddingRight: 0,
    },
    body: {
        padding: 0,
    },
};

const List = ({children}) => (
    <div className="DetailsCard-list">{children}</div>
);

const ListItem = ({label, text, children}) => (
    <div>
        {label && <label style={{fontWeight: "bold", marginRight: 5}}>{label}:</label>}
        {text}
        {children}
    </div>
);

const EditButton = props => {
    const { model, tooltip, icon, onClick } = props;
    const iconStyle = { width: 14, height: 14, padding: 0, marginLeft: 2 };

    if (model && model.access && model.access.update) {
        return (
            <IconButton tooltip={tooltip} onClick={onClick} style={iconStyle} iconStyle={iconStyle}>
                <SvgIcon icon={icon} color={grey600} />
            </IconButton>
        );
    } else {
        return null;
    }
};

const descriptionMaxLength = 250;

const getDescription = (d2, model) => {
    const {description} = model;

    if (!description) {
        return (<i>{d2.i18n.getTranslation('no_description')}</i>)
    } else if (description.length < descriptionMaxLength) {
        return description;
    } else {
        return description.substring(0, descriptionMaxLength) + ' ...';
    }
};

const getOwner = model => {
    return model.user ? model.user.displayName : '-';
};

const accessMapping = {
    "--------": "none",
    "r-------": "read",
    "rw------": "read_write",
};

const getSharingText = (d2, model) => {
    const publicAccessKey = accessMapping[model.publicAccess] || "unknown";
    const publicAccess = d2.i18n.getTranslation('public') + ": " +
        d2.i18n.getTranslation("access_" + publicAccessKey);

    const userGroupsCount = _.size(model.userGroupAccesses);
    const userGroupsInfo = userGroupsCount > 2
        ? `${userGroupsCount} ${d2.i18n.getTranslation('user_groups')}`
        : (model.userGroupAccesses || []).map(userGroup => userGroup.displayName).join(", ");

    return publicAccess + (userGroupsInfo ? ` + ${userGroupsInfo}` : "");
};

class DetailsCard extends React.Component {
    state = {
        isExpanded: true,
        isSharingDialogOpen: false,
        isDetailsDialogOpen: false,
    };

    notifyFavoriteChanges(model) {
        if (this.props.onChange) {
            this.props.onChange(model);
        }
    }

    saveDetailsAndCloseDialog(newModel) {
        newModel.save().then(() => {
            this.notifyFavoriteChanges(newModel);
            this.closeDetailsDialog();
        });
    }

    updateModelAndCloseDialog(newAttributes) {
        const newModel = this.props.model.clone();
        Object.assign(newModel, newAttributes);
        this.closeSharingDialog();
        this.notifyFavoriteChanges(newModel);
    }

    toggleDetailsExpand() {
        this.setState({isExpanded: true});
    }

    openDetailsDialog() {
        this.setState({isDetailsDialogOpen: true});
    }

    closeDetailsDialog() {
        this.setState({isDetailsDialogOpen: false});
    }

    openSharingDialog() {
        this.setState({isSharingDialogOpen: true});
    }

    closeSharingDialog() {
        this.setState({isSharingDialogOpen: false});
    }

    render() {
        const { model } = this.props;
        const { isExpanded, isSharingDialogOpen, isDetailsDialogOpen } = this.state;
        const { d2 } = this.context;
        const getTranslation = d2.i18n.getTranslation.bind(d2.i18n);

        return (
            <Card
                className="DetailsCard"
                containerStyle={styles.container}
                expanded={isExpanded}
                onExpandChange={this.toggleDetailsExpand.bind(this)}
            >
                <SharingDialog
                    open={isSharingDialogOpen}
                    type={model.modelDefinition.name}
                    id={model.id}
                    onRequestClose={this.updateModelAndCloseDialog.bind(this)}
                    d2={d2}
                />

                <DetailsDialog
                    open={isDetailsDialogOpen}
                    model={model}
                    onSave={this.saveDetailsAndCloseDialog.bind(this)}
                    onClose={this.closeDetailsDialog.bind(this)}
                />

                <CardHeader
                    className="DetailsCard-header"
                    title={getTranslation('details')}
                    showExpandableButton={true}
                    textStyle={styles.headerText}
                >
                </CardHeader>

                <CardText expandable={true} style={styles.body}>
                    <List>
                        <ListItem text={getDescription(d2, model)}>
                            <EditButton
                                icon="Create"
                                model={model}
                                tooltip={getTranslation('edit_details')}
                                onClick={this.openDetailsDialog.bind(this)}
                            />
                        </ListItem>

                        <ListItem label={getTranslation('owner')} text={getOwner(model)} />

                        <ListItem label={getTranslation('created')} text={getDateFromString(model.created)} />

                        <ListItem label={getTranslation('last_updated')} text={getDateFromString(model.lastUpdated)} />

                        <ListItem label={getTranslation('views')} text={model.favoriteViews} />

                        <ListItem label={getTranslation('sharing')} text={getSharingText(d2, model)}>
                            <EditButton
                                icon="Group"
                                model={model}
                                tooltip={getTranslation("edit_sharing")}
                                onClick={this.openSharingDialog.bind(this)}
                            />
                        </ListItem>
                    </List>
                </CardText>
            </Card>
        );
    }
}

DetailsCard.propTypes = {
    model: PropTypes.object.isRequired,
    onChange: PropTypes.func,
};

DetailsCard.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default DetailsCard;
