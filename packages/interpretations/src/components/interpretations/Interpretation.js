import React from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import { getDateFromString } from '../../util/dateUtils';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { FormattedDate } from 'react-intl';
import InterpretationComments from './InterpretationComments';
import InterpretationDialog from '../interpretation-dialog/InterpretationDialog';
import { Link, ActionSeparator, WithAvatar, getUserLink } from './misc';
import { userCanManage } from '../../util/auth';
import { config } from 'd2/lib/d2';

//import './Interpretation.css';

config.i18n.strings.add('edit');
config.i18n.strings.add('delete');
config.i18n.strings.add('delete_interpretation_confirmation');
config.i18n.strings.add('like');
config.i18n.strings.add('unlike');
config.i18n.strings.add('people_like_this');
config.i18n.strings.add('people_commented');

const styles = {
    like: {
        width: 16,
        height: 16,
        marginRight: 5,
        verticalAlign: "top",
    },
};

const EllipsisText = ({ max, text }) => {
    const finalText = text && text.length > max ? `${text.slice(0, max)} ...` : text;
    return <span>{finalText}</span>;
};

class Interpretation extends React.Component {
    state = {
        interpretationToEdit: null,
    };

    constructor(props) {
        super(props);
        this.notifyChange = this.notifyChange.bind(this);
        this.saveInterpretationAndClose = this.saveInterpretationAndClose.bind(this);
        this.closeInterpretationDialog = this.closeInterpretationDialog.bind(this);
        this.deleteInterpretation = this.deleteInterpretation.bind(this);
        this.openInterpretationDialog = this.openInterpretationDialog.bind(this);
        this.like = this.like.bind(this);
        this.unlike = this.unlike.bind(this);
        this.saveComment = this.saveComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }

    notifyChange() {
        if (this.props.onChange) {
            this.props.onChange();
        }
    }

    saveInterpretationLike(interpretation, value) {
        interpretation.like(value).then(this.notifyChange);
    }

    like() {
        this.saveInterpretationLike(this.props.interpretation, true);
    }

    unlike() {
        this.saveInterpretationLike(this.props.interpretation, false);
    }

    deleteInterpretation() {
        const { d2, interpretation } = this.props;
        if (confirm(d2.i18n.getTranslation('delete_interpretation_confirmation'))) {
            interpretation.delete().then(this.notifyChange);
        }
    }

    openInterpretationDialog() {
        this.setState({interpretationToEdit: this.props.interpretation});
    }

    closeInterpretationDialog() {
        this.setState({interpretationToEdit: null});
    }

    saveInterpretation(interpretation) {
        interpretation.save().then(this.notifyChange);
    }

    saveComment(comment) {
        comment.save().then(this.notifyChange);
    }

    deleteComment(comment) {
        comment.delete().then(this.notifyChange);
    }

    saveInterpretationAndClose() {
        this.saveInterpretation(this.props.interpretation);
        this.closeInterpretationDialog();
    }

    render() {
        const {  interpretation, model, showActions, showComments } = this.props;
        const { interpretationToEdit } = this.state;
        const { d2 } = this.context;
        const comments = _(interpretation.comments).sortBy("created").reverse().value();
        const likedByTooltip = _(interpretation.likedBy).map(user => user.displayName).sortBy().join("\n");
        const currentUserLikesInterpretation = _(interpretation.likedBy).some(user => user.id === d2.currentUser.id);

        return (
            <div className="interpretationContainer">
                {interpretationToEdit &&
                    <InterpretationDialog
                        model={model}
                        interpretation={interpretationToEdit}
                        onSave={this.saveInterpretationAndClose}
                        onClose={this.closeInterpretationDialog}
                    />
                }

                <div className="interpretationDescSection">
                    <div className="interpretationName">
                        {getUserLink(d2, interpretation.user)}

                        <span className="tipText leftSpace">
                            <FormattedDate value={interpretation.created} day="2-digit" month="short" year="numeric" />
                        </span>
                    </div>

                    <div className="interpretationText">
                        <div>
                            <EllipsisText max={200} text={interpretation.text} />
                        </div>
                    </div>

                    <div>
                        {showActions &&
                            <div>
                                {currentUserLikesInterpretation
                                    ? <Link label={d2.i18n.getTranslation('unlike')} onClick={this.unlike} />
                                    : <Link label={d2.i18n.getTranslation('like')} onClick={this.like} />}
                                {userCanManage(d2, interpretation) &&
                                    <span>
                                        <ActionSeparator />
                                        <Link label={d2.i18n.getTranslation('edit')} onClick={this.openInterpretationDialog} />
                                        <ActionSeparator />
                                        <Link label={d2.i18n.getTranslation('delete')} onClick={this.deleteInterpretation} />
                                    </span>}
                            </div>
                        }

                        <div className="interpretationCommentArea">
                            <div className="likeArea greyBackground">
                                <SvgIcon icon="ThumbUp" style={styles.like} />

                                <span style={{color: "#22A"}} title={likedByTooltip}>
                                    {interpretation.likes} {d2.i18n.getTranslation('people_like_this')}
                                </span>

                                <ActionSeparator />

                                {`${interpretation.comments.length} ${d2.i18n.getTranslation('people_commented')}`}
                            </div>

                            {showComments &&
                                <InterpretationComments
                                    d2={d2}
                                    interpretation={interpretation}
                                    onSave={this.saveComment}
                                    onDelete={this.deleteComment}
                                />}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Interpretation.propTypes = {
    model: PropTypes.object.isRequired,
    interpretation: PropTypes.object.isRequired,
    showActions: PropTypes.bool.isRequired,
    showComments: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

Interpretation.defaultProps = {
    showActions: false,
    showComments: false,
};

Interpretation.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default Interpretation;
