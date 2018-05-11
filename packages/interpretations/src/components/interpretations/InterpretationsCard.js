import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/FlatButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle-outline';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { grey600 } from 'material-ui/styles/colors';
import { config } from 'd2/lib/d2';
import size from 'lodash/fp/size';
import InterpretationDialog from '../interpretation-dialog/InterpretationDialog';
import { getDateFromString } from '../../util/dateUtils';
import Interpretation from './Interpretation';
import interpretationModel from '../../models/interpretation';
import styles from './InterpretationsStyles.js';

config.i18n.strings.add('no_interpretations');
config.i18n.strings.add('clear_interpretation');
config.i18n.strings.add('write_new_interpretation');
config.i18n.strings.add('interpretations');

const EditButton = props => {
    const { model, tooltip, icon, onClick } = props;
    const iconStyle = {width: 14, height: 14, padding: 0, marginLeft: 2};

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

const InterpretationsList = props => {
    const { d2, model, interpretations, setCurrentInterpretation, onChange } = props;
    const getUserUrl = user => `${baseurl}/dhis-web-messaging/profile.action?id=${user.id}`;

    return (
        <div>
            <div style={{fontStyle: "italic", marginLeft: 15}}>
                {interpretations.length === 0 && <span>{d2.i18n.getTranslation('no_interpretations')}</span>}
            </div>

            {interpretations.map(interpretation => (
                <div
                    key={interpretation.id}
                    style={styles.interpretation}
                    onClick={() => setCurrentInterpretation(interpretation.id)}
                >
                    <Interpretation d2={d2} model={model} interpretation={interpretation} onChange={onChange} />
                </div>
            ))}
        </div>
    );
};

const InterpretationDetails = props => {
    const { d2, model, interpretation, onChange } = props;
    const comments = _(interpretation.comments).sortBy("created").reverse().value();

    return (
        <Interpretation
            d2={d2}
            model={model}
            interpretation={interpretation}
            onChange={onChange}
            showActions={true}
            showComments={true}
        />
    );
};

const InterpretationButtons = ({ d2, model, currentInterpretation, setCurrentInterpretation, openInterpretationDialog }) => (
    currentInterpretation ?
        <IconButton
            style={styles.back}
            onClick={() => setCurrentInterpretation(null)}
            tooltip={d2.i18n.getTranslation('clear_interpretation')}
        >
           <SvgIcon icon="ChevronLeft" color={grey600} />
        </IconButton>
    :
        <IconButton
            style={styles.newInterpretation}
            onClick={() => openInterpretationDialog(new interpretationModel(model, {}))}
            tooltip={d2.i18n.getTranslation('write_new_interpretation')}
            tooltipPosition="bottom-left"
        >
            <SvgIcon icon="Add" color={grey600} />
        </IconButton>
);

class InterpretationsCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExpanded: true,
            interpretationToEdit: null,
            currentInterpretationId: props.currentInterpretationId,
        };

        this.notifyChange = this.notifyChange.bind(this);
        this.toggleExpand = this.toggleExpand.bind(this);
        this.openInterpretationDialog = this.openInterpretationDialog.bind(this);
        this.closeInterpretationDialog = this.closeInterpretationDialog.bind(this);
        this.saveInterpretationAndClose = this.saveInterpretationAndClose.bind(this);
        this.setCurrentInterpretation = this.setCurrentInterpretation.bind(this);
        this.isControlledComponent = !!props.onCurrentInterpretationChange;
    }

    componentWillReceiveProps(nextProps) {
        if (this.isControlledComponent) {
            this.setState({ currentInterpretationId: nextProps.currentInterpretationId });
        }
    }

    notifyChange(interpretation) {
        this.setCurrentInterpretation(interpretation ? interpretation.id : null);

        if (this.props.onChange) {
            this.props.onChange();
        }
    }

    toggleExpand() {
        this.setState({ isExpanded: !this.state.isExpanded });
    }

    openInterpretationDialog(interpretation) {
        this.setState({ interpretationToEdit: interpretation });
    }

    closeInterpretationDialog() {
        this.setState({ interpretationToEdit: null });
    }

    saveInterpretation(interpretation) {
        interpretation.save().then(this.notifyChange);
    }

    setCurrentInterpretation(interpretationId) {
        const { model, onCurrentInterpretationChange } = this.props;
        if (this.isControlledComponent) {
            const currentInterpretation = interpretationId
                ? model.interpretations.find(interpretation => interpretation.id === interpretationId)
                : null;
            onCurrentInterpretationChange(currentInterpretation);
        } else {
            this.setState({ currentInterpretationId: interpretationId });
        }
    }

    saveInterpretationAndClose(interpretation) {
        this.saveInterpretation(interpretation);
        this.closeInterpretationDialog();
    }

    render() {
        const { model } = this.props;
        const { isExpanded, interpretationToEdit, currentInterpretationId } = this.state;
        const { d2 } = this.context;
        const sortedInterpretations = _(model.interpretations).sortBy("created").reverse().value();
        const currentInterpretation = currentInterpretationId
            ? model.interpretations.find(interpretation => interpretation.id === currentInterpretationId)
            : null;

        return (
            <Card
                style={styles.interpretationsCard}
                containerStyle={styles.container}
                expanded={isExpanded}
                onExpandChange={this.toggleExpand}
            >
                {interpretationToEdit &&
                    <InterpretationDialog
                        model={model}
                        interpretation={interpretationToEdit}
                        onSave={this.saveInterpretationAndClose}
                        onClose={this.closeInterpretationDialog}
                    />
                }

                <CardHeader
                    style={styles.interpretationsCardHeader}
                    title={d2.i18n.getTranslation('interpretations')}
                    showExpandableButton={true}
                    textStyle={styles.headerText}
                >
                    <InterpretationButtons
                        d2={d2}
                        model={model}
                        currentInterpretation={currentInterpretation}
                        setCurrentInterpretation={this.setCurrentInterpretation}
                        openInterpretationDialog={this.openInterpretationDialog}
                    />
                </CardHeader>

                <CardText expandable={true} style={styles.body}>
                    {currentInterpretation
                        ?
                            <InterpretationDetails
                                d2={d2}
                                model={model}
                                interpretation={currentInterpretation}
                                onChange={this.notifyChange}
                            />
                        :
                            <InterpretationsList
                                d2={d2}
                                model={model}
                                interpretations={sortedInterpretations}
                                setCurrentInterpretation={this.setCurrentInterpretation}
                                onChange={this.notifyChange}
                            />
                    }
                </CardText>
            </Card>
        );
    }
}

InterpretationsCard.propTypes = {
    model: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    currentInterpretationId: PropTypes.string,
    onCurrentInterpretationChange: PropTypes.func,
};

InterpretationsCard.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default InterpretationsCard;
