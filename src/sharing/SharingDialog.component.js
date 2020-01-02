import { config } from 'd2/lib/d2';
import createReactClass from 'create-react-class';
import PropTypes from "prop-types";
import Dialog from 'material-ui/Dialog/Dialog';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import IconButton from 'material-ui/IconButton';
import React from 'react';
import Translate from '../i18n/Translate.mixin';
import Sharing from './Sharing.component';
import sharingStore from './sharing.store';

config.i18n.strings.add('close');
config.i18n.strings.add('sharing_settings');

export default createReactClass({
    propTypes: {
        objectsToShare: PropTypes.arrayOf(PropTypes.object).isRequired,
        onRequestClose: PropTypes.func.isRequired,
        onError: PropTypes.func,
        onSave: PropTypes.func,
    },

    mixins: [Translate],

    render() {
        const sharingDialogActions = [
            <FlatButton
                label={this.getTranslation('close')}
                onClick={this.closeSharingDialog} />,
        ];

        const title = (
            <div>
                <span>{this.getTranslation('sharing_settings')}</span>
                {this.props.objectsToShare && this.props.objectsToShare.length > 1 ?
                    <IconButton
                        tooltip={this.getTranslation('sharing_settings_help')}
                        tooltipPosition="bottom-center"
                        iconClassName="material-icons"
                        >
                        help_outline
                    </IconButton> : null}
            </div>
        );

        return (
            <Dialog
                title={title}
                actions={sharingDialogActions}
                autoDetectWindowHeight
                autoScrollBodyContent
                {...this.props}
                onRequestClose={this.closeSharingDialog}
            >
                <Sharing
                    objectsToShare={this.props.objectsToShare}
                    onError={this.onError}
                    onSave={this.props.onSave}
                />
            </Dialog>
        );
    },

    onError(err) {
        this.props.onError && this.props.onError(err);
        this.closeSharingDialog();
    },

    closeSharingDialog() {
        this.props.onRequestClose(sharingStore.getState());
    },
});
