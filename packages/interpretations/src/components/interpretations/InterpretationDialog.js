import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import { Button } from '@dhis2/d2-ui-core';
import TextField from 'material-ui/TextField';
import { config } from 'd2/lib/d2';
import CKEditor from '../CKEditor';
import defer from 'lodash/fp/defer';

config.i18n.strings.add('edit_interpretation');
config.i18n.strings.add('create_interpretation');
config.i18n.strings.add('cancel');
config.i18n.strings.add('save');

const styles = {
    dialog: {
        maxWidth: 600,
        height: 500,
    },
};

class InterpretationDialog extends Component {
    constructor(props) {
        super(props);
        this.state = { value: props.interpretation ? props.interpretation.text : "", showEditor: true };
        this.save = this.hideEditorAndThen(this._save.bind(this));
        this.cancel = this.hideEditorAndThen(this._cancel.bind(this));
        this.onChange = this.onChange.bind(this);
    }

    hideEditorAndThen(fn) {
        // Method componentWillUnmount of child components of Dialog are called *after* their nodes
        // are removed from the DOM (bug in mui?), which triggers errors in CKEditor.destroy.
        // Workaround: Manually unmount the component using a flag in state.
        return (...args) =>
            this.setState({ showEditor: false }, () => defer(() => fn(...args)));
    }

    _cancel() {
        this.props.onClose();
    }

    _save() {
        const { interpretation, onSave } = this.props;
        const { value } = this.state;
        interpretation.text = value;
        onSave(interpretation);
    }

    onChange(newValue) {
        this.setState({ value: newValue });
    }

    render() {
        const { d2 } = this.context;
        const { interpretation, onSave } = this.props;
        const { value, showEditor } = this.state;
        const title = interpretation && interpretation.id
            ? d2.i18n.getTranslation('edit_interpretation')
            : d2.i18n.getTranslation('create_interpretation');

        return (
            <Dialog
                title={title}
                open={true}
                onRequestClose={this.cancel}
                actions={[
                    <Button color="primary" onClick={this.cancel}>
                        {d2.i18n.getTranslation('cancel')}
                    </Button>,
                    <Button
                        color="primary"
                        disabled={value ? false : true}
                        onClick={this.save}
                    >
                        {d2.i18n.getTranslation('save')}
                    </Button>,
                ]}
                contentStyle={styles.dialog}
                repositionOnUpdate={false}
            >
                {showEditor && <CKEditor
                    options={{height: 150}}
                    onEditorChange={this.onChange}
                    initialContent={value}
                />}
            </Dialog>
        );
    }
}

InterpretationDialog.propTypes = {
    interpretation: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

InterpretationDialog.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default InterpretationDialog;
