import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import TextField from 'material-ui/TextField';
import { config } from 'd2/lib/d2';

config.i18n.strings.add('edit_interpretation');
config.i18n.strings.add('create_interpretation');
config.i18n.strings.add('cancel');
config.i18n.strings.add('save');

const styles = {
    dialog: {
        maxWidth: 600,
    },
    textfield: {
        width: '100%',
    },
};

class InterpretationDialog extends Component {
    constructor(props) {
        super(props);
        this.state = { value: props.interpretation ? props.interpretation.text : "" };
    }

    render() {
        const { d2 } = this.context;
        const { interpretation, favoriteId, onSave, onClose } = this.props;
        const { value } = this.state;
        const title = interpretation && interpretation.id
            ? d2.i18n.getTranslation('edit_interpretation')
            : d2.i18n.getTranslation('create_interpretation');

        return (
            <Dialog
                title={title}
                open={true}
                onRequestClose={onClose}
                actions={[
                    <Button color="primary" onClick={onClose}>
                        {d2.i18n.getTranslation('cancel')}
                    </Button>,
                    <Button
                        color="primary"
                        disabled={value ? false : true}
                        onClick={() => onSave({ ...interpretation, text: value })}
                    >
                        {d2.i18n.getTranslation('save')}
                    </Button>,
                ]}
                contentStyle={styles.dialog}
            >
                <TextField
                    name="interpretation"
                    value={value}
                    multiLine={true}
                    rows={1}
                    onChange={(evt, value) => this.setState({ value })}
                    style={styles.textfield}
                />
            </Dialog>
        );
    }
}

InterpretationDialog.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default InterpretationDialog;
