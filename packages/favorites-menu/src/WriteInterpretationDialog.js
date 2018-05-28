import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { FormControl } from 'material-ui/Form';

class WriteInterpretationDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            interpretationText: '',
        };
    }

    onRequestClose = () => {
        // reset form so when the dialog is reopened is consistent
        // with the actual favorite
        this.setState({ interpretationText: '' });

        this.props.onRequestClose();
    };

    handleChange = field => event => {
        event.preventDefault();

        this.setState({
            [field]: event.target.value,
        });
    };

    handleSubmit = async event => {
        event.preventDefault();

        const {
            favoriteType,
            favoriteModel,
            onRequestWriteInterpretation,
            onRequestWriteInterpretationError,
        } = this.props;

        if (favoriteModel) {
            const form = this.state;
            const url = `/interpretations/${favoriteType}/${favoriteModel.id}`;
            const headers = { 'Content-Type': 'text/plain' };

            try {
                await this.context.d2.Api.getApi().post(url, form.interpretationText, { headers });

                if (onRequestWriteInterpretation) {
                    onRequestWriteInterpretation();
                }
            } catch (err) {
                onRequestWriteInterpretationError(err);
            }
        }
    };

    render() {
        const { open } = this.props;

        return (
            <Dialog open={open} onClose={this.onRequestClose} maxWidth="md">
                <form onSubmit={this.handleSubmit}>
                    <DialogTitle>Write interpretation</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <TextField
                                value={this.state.interpretationText}
                                required
                                margin="normal"
                                multiline
                                rowsMax={4}
                                onChange={this.handleChange('interpretationText')}
                            />
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onRequestClose} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" onClick={this.handleSubmit} color="primary">
                            Post
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

WriteInterpretationDialog.contextTypes = {
    d2: PropTypes.object,
};

WriteInterpretationDialog.defaultProps = {
    open: false,
    favoriteModel: null,
    onRequestClose: null,
    onRequestWriteInterpretation: null,
    onRequestWriteInterpretationError: null,
};

WriteInterpretationDialog.propTypes = {
    open: PropTypes.bool,
    favoriteModel: PropTypes.object,
    onRequestClose: PropTypes.func,
    onRequestWriteInterpretation: PropTypes.func,
    onRequestWriteInterpretationError: PropTypes.func,
};

export default WriteInterpretationDialog;
