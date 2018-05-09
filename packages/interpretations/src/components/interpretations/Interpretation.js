import React from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import { connect } from 'react-redux';
import { getDateFromString } from '../../util/dateUtils';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { FormattedDate } from 'react-intl';
import InterpretationComments from './InterpretationComments';
import { Link, ActionSeparator, WithAvatar, getUserLink } from './misc';
import { userCanManage } from '../../util/auth';
import { config } from 'd2/lib/d2';

//import './Interpretation.css';

import {
    saveInterpretationLike,
    deleteInterpretation,
    openInterpretationDialog,
    saveComment,
    deleteComment,
} from '../../actions/interpretations';

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

const onDeleteInterpretationClick = (d2, interpretation, deleteInterpretation) => {
    if (confirm(d2.i18n.getTranslation('delete_interpretation_confirmation'))) {
        deleteInterpretation(interpretation);
    }
};

const Interpretation = props => {
    const {
        interpretation,
        d2,
        showActions,
        showComments,
        saveInterpretationLike,
        deleteInterpretation,
        openInterpretationDialog,
        saveComment,
        deleteComment,
    } = props;

    const comments = _(interpretation.comments).sortBy("created").reverse().value();
    const likedByTooltip = _(interpretation.likedBy).map(user => user.displayName).sortBy().join("\n");
    const currentUserLikesInterpretation = () =>
        _(interpretation.likedBy).some(user => user.id === d2.currentUser.id);

    return (
        <div className="interpretationContainer">
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
                            {currentUserLikesInterpretation()
                                ? <Link label={d2.i18n.getTranslation('unlike')} onClick={() => saveInterpretationLike(interpretation, false)} />
                                : <Link label={d2.i18n.getTranslation('like')} onClick={() => saveInterpretationLike(interpretation, true)} />}
                            {userCanManage(d2, interpretation) &&
                                <span>
                                    <ActionSeparator />
                                    <Link label={d2.i18n.getTranslation('edit')}
                                        onClick={() => openInterpretationDialog(interpretation)} />
                                    <ActionSeparator />
                                    <Link label={d2.i18n.getTranslation('delete')}
                                        onClick={() => onDeleteInterpretationClick(d2, interpretation, deleteInterpretation)} />
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
                                comments={comments}
                                onSave={comment => saveComment(interpretation, comment)}
                                onDelete={comment => deleteComment(interpretation, comment)}
                            />}
                    </div>
                </div>
            </div>
        </div>
    );
};

Interpretation.propTypes = {
    d2: PropTypes.object.isRequired,
    interpretation: PropTypes.object.isRequired,
    saveInterpretationLike: PropTypes.func.isRequired,
    saveComment: PropTypes.func.isRequired,
    deleteComment: PropTypes.func.isRequired,
};

export default connect(
    state => ({
    }),
    {
        saveInterpretationLike,
        deleteInterpretation,
        openInterpretationDialog,
        saveComment,
        deleteComment,
    },
)(Interpretation);
