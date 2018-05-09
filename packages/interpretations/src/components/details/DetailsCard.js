import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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

import {
    toggleDetailsExpand,
    openSharingDialog,
    closeSharingDialog,
    openDetailsDialog,
    closeDetailsDialog,
} from '../../actions/details';

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

const List = ({children}) =>
    <div className="DetailsCard-list">{children}</div>;

const ListItem = ({label, children}) => (
    <div>
        {label && <label style={{fontWeight: "bold", marginRight: 5}}>{label}:</label>}
        {children}
    </div>
);

const EditButton = props => {
    const { map, tooltip, icon, onClick } = props;
    const iconStyle = { width: 14, height: 14, padding: 0, marginLeft: 2 };

    if (map && map.access && map.access.update) {
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

const getDescription = (d2, map) => {
    const {description} = map;

    if (!description) {
        return (<i>{d2.i18n.getTranslation('no_description')}</i>)
    } else if (description.length < descriptionMaxLength) {
        return description;
    } else {
        return description.substring(0, descriptionMaxLength) + ' ...';
    }
};

const getOwner = map => {
    return map.user ? map.user.displayName : '-';
};

const accessMapping = {
    "--------": "none",
    "r-------": "read",
    "rw------": "read_write",
};

const getSharingText = (d2, map) => {
    const publicAccessKey = accessMapping[map.publicAccess] || "unknown";
    const publicAccess = d2.i18n.getTranslation('public') + ": " + d2.i18n.getTranslation("access_" + publicAccessKey);

    const userGroupsCount = _.size(map.userGroupAccesses);
    const userGroupsInfo = userGroupsCount > 2
        ? `${userGroupsCount} ${d2.i18n.getTranslation('user_groups')}`
        : (map.userGroupAccesses || []).map(userGroup => userGroup.displayName).join(", ");

    return publicAccess + (userGroupsInfo ? ` + ${userGroupsInfo}` : "");
};

const DetailsCard = (props, context) => {
    const {
        map,
        isExpanded,
        toggleDetailsExpand,
        isSharingDialogOpen,
        openSharingDialog,
        closeSharingDialog,
        openDetailsDialog,
        closeDetailsDialog,
        isDetailsDialogOpen,
        //saveFavorite, // TODO
        onFavoriteChange,
    } = props;

    const saveDetailsAndCloseDialog = (map, newAttributes) => {
        onFavoriteChange(newAttributes);
        //saveFavorite(Object.keys(newAttributes));
        closeDetailsDialog();
    };

    const { d2 } = context;

    const updateMapAndCloseDialog = (map) => {
        const newAttributes = pick(["publicAccess", "userGroupAccesses"], map);
        onFavoriteChange(newAttributes);
        closeSharingDialog();
    };

    return (
        <Card
            className="DetailsCard"
            containerStyle={styles.container}
            expanded={isExpanded}
            onExpandChange={toggleDetailsExpand}
        >
            <SharingDialog
                open={isSharingDialogOpen}
                type="map"
                id={map.id}
                onRequestClose={updateMapAndCloseDialog}
                d2={d2}
            />

            <DetailsDialog
                open={isDetailsDialogOpen}
                favorite={map}
                onSave={saveDetailsAndCloseDialog}
                onClose={closeDetailsDialog}
            />

            <CardHeader
                className="DetailsCard-header"
                title={d2.i18n.getTranslation('details')}
                showExpandableButton={true}
                textStyle={styles.headerText}
            >
            </CardHeader>

            <CardText expandable={true} style={styles.body}>
                <List>
                    <ListItem>
                        {getDescription(d2, map)}
                        <EditButton icon="Create" map={map} tooltip="Edit details" onClick={openDetailsDialog} />
                    </ListItem>

                    <ListItem label={d2.i18n.getTranslation('owner')}>
                        {getOwner(map)}
                    </ListItem>

                    <ListItem label={d2.i18n.getTranslation('created')}>
                        {getDateFromString(map.created)}
                    </ListItem>

                    <ListItem label={d2.i18n.getTranslation('last_updated')}>
                        {getDateFromString(map.lastUpdated)}
                    </ListItem>

                    <ListItem label={d2.i18n.getTranslation('views')}>
                        {map.favoriteViews}
                    </ListItem>

                    <ListItem label={d2.i18n.getTranslation('sharing')}>
                        {getSharingText(d2, map)}

                        <EditButton icon="Group" map={map} tooltip={d2.i18n.getTranslation("edit_sharing")} onClick={openSharingDialog} />
                    </ListItem>
                </List>
            </CardText>
        </Card>
    );
};

DetailsCard.propTypes = {
    map: PropTypes.object.isRequired,
    isExpanded: PropTypes.bool,
    toggleDetailsExpand: PropTypes.func.isRequired,
    isSharingDialogOpen: PropTypes.bool.isRequired,
    openSharingDialog: PropTypes.func.isRequired,
    closeSharingDialog: PropTypes.func.isRequired,
    openDetailsDialog: PropTypes.func.isRequired,
    closeDetailsDialog: PropTypes.func.isRequired,
    onFavoriteChange: PropTypes.func.isRequired,
};

DetailsCard.defaultProps = {
    isExpanded: true,
    isSharingDialogOpen: false,
    isDetailsDialogOpen: false,
};

DetailsCard.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default connect(
    state => ({
        isExpanded: state.details.isExpanded,
        isSharingDialogOpen: state.details.isSharingDialogOpen,
        isDetailsDialogOpen: state.details.isDetailsDialogOpen,
    }),
    {
        toggleDetailsExpand,
        openSharingDialog,
        closeSharingDialog,
        openDetailsDialog,
        closeDetailsDialog,
    },
)(DetailsCard);
